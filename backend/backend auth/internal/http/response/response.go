package response

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// FormatValidationError formats validation and json binding errors into clean, concise messages.
func FormatValidationError(err error) string {
	if err == nil {
		return ""
	}

	// 1. Handle JSON Unmarshal Type Error (e.g. passing object for string - NoSQL injection tests)
	var unmarshalErr *json.UnmarshalTypeError
	if errors.As(err, &unmarshalErr) {
		return fmt.Sprintf("noSQL Injection detected")
	}

	// 2. Handle JSON Syntax Error
	var syntaxErr *json.SyntaxError
	if errors.As(err, &syntaxErr) {
		return "invalid json syntax"
	}

	// 3. Handle EOF (Empty Body)
	if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
		return "request body is empty or malformed"
	}

	// 4. Handle Validation Tags Errors
	var valErrs validator.ValidationErrors
	if errors.As(err, &valErrs) {
		for _, e := range valErrs {
			field := e.Field()
			tag := e.Tag()
			param := e.Param()

			fieldName := strings.ToLower(field)

			switch tag {
			case "required":
				return fmt.Sprintf("%s is required", fieldName)
			case "email":
				return fmt.Sprintf("%s must be a valid email address", fieldName)
			case "min":
				return fmt.Sprintf("%s must be at least %s characters", fieldName, param)
			case "max":
				return fmt.Sprintf("%s must be at most %s characters", fieldName, param)
			case "eqfield":
				return fmt.Sprintf("%s must match %s", fieldName, strings.ToLower(param))
			case "oneof":
				return fmt.Sprintf("%s must be one of: %s", fieldName, strings.ReplaceAll(param, " ", ", "))
			default:
				return fmt.Sprintf("%s validation failed on '%s'", fieldName, tag)
			}
		}
	}

	return err.Error()
}

// SendError returns a consistent structured JSON error response.
func SendError(c *gin.Context, status int, code, message string) {
	c.JSON(status, gin.H{
		"success": false,
		"error": gin.H{
			"code":    code,
			"message": message,
		},
	})
}
