package request

type ContactInput struct {
	Type  string `json:"type" binding:"required,oneof=email phone"`
	Value string `json:"value" binding:"required"`
}

type ReporterInput struct {
	Name    string         `json:"name" binding:"required"`
	Role    string         `json:"role" binding:"required,oneof=visitor victim"`
	Contact []ContactInput `json:"contact"`
}

type LossInput struct {
	Amount   float64 `json:"amount" binding:"required,min=0"`
	Currency string  `json:"currency" binding:"required"`
}

type OtherEntitiesInput struct {
	Web     []string `json:"web"`
	Phone   []string `json:"phone"`
	Name    []string `json:"name"`
	Address []string `json:"address"`
	Social  []string `json:"social"`
}

type RawDataInput struct {
	Title  string              `json:"title" binding:"required"`
	URL    string              `json:"url,omitempty"`
	Domain string              `json:"domain,omitempty"`
	Detail string              `json:"detail,omitempty"`
	Images []string            `json:"images,omitempty"`
	Other  *OtherEntitiesInput `json:"other,omitempty"`
	Losses []LossInput         `json:"losses,omitempty"`
}

type SubmitReportInput struct {
	Type     *int          `json:"type" binding:"required,oneof=0 1"` // using pointer for required integer check
	Reporter ReporterInput `json:"reporter" binding:"required"`
	Raw      RawDataInput  `json:"raw" binding:"required"`
}
