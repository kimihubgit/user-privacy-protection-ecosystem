package chat

import (
	"encoding/json"
	"log"
)

// Message represents the chat message payload exchanged between guests and moderators.
type Message struct {
	SessionID string `json:"session_id"` // Unique identifier for the chat thread (UUID)
	Sender    string `json:"sender"`     // Display name of the sender
	Role      string `json:"role"`       // "guest" | "user" | "moderator"
	Content   string `json:"content"`    // Chat text content
	Timestamp int64  `json:"timestamp"`  // Epoch timestamp in milliseconds
}

// Hub manages WebSocket client connections and routes chat messages.
type Hub struct {
	// Registered active connections
	clients    map[*Client]bool
	Register   chan *Client
	Unregister chan *Client

	// Message channel for routing
	Broadcast  chan []byte

	// Active chat session assignments: GuestSessionID -> ModeratorUsername
	assignments map[string]string
}

// NewHub initializes and returns a new Hub instance.
func NewHub() *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		Register:    make(chan *Client),
		Unregister:  make(chan *Client),
		Broadcast:   make(chan []byte),
		assignments: make(map[string]string),
	}
}

// Run executes the hub routing loop in a blocking manner.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.clients[client] = true
			log.Printf("[Chat] Registered connection: %s (Role: %s, Session: %s)", client.Username, client.Role, client.SessionID)

		case client := <-h.Unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)

				// If an active moderator/admin disconnects, release all their assigned sessions
				if client.Role == "moderator" || client.Role == "admin" || client.Role == "super_admin" {
					h.releaseModeratorAssignments(client.Username)
				}
				log.Printf("[Chat] Unregistered connection: %s", client.Username)
			}

		case msgBytes := <-h.Broadcast:
			var msg Message
			if err := json.Unmarshal(msgBytes, &msg); err != nil {
				log.Printf("[Chat] Failed to unmarshal message: %v", err)
				continue
			}

			// Routing & Load Balancing Logic
			if msg.Role == "guest" || msg.Role == "user" {
				// 1. Guest/User sends a message -> Send it to their assigned moderator
				modUsername := h.getOrAssignModerator(msg.SessionID)
				if modUsername != "" {
					h.sendToModerator(modUsername, msgBytes)
				} else {
					log.Printf("[Chat] Warning: No active moderators available to handle session: %s", msg.SessionID)
				}
			} else if msg.Role == "moderator" {
				// 2. Moderator replies -> Route to the specific guest/user session
				h.sendToGuest(msg.SessionID, msgBytes)
			}
		}
	}
}

// getOrAssignModerator resolves or assigns a moderator to a session using the Least Connections algorithm.
func (h *Hub) getOrAssignModerator(sessionID string) string {
	// If session already has an assigned moderator and they are online, return them
	if assignedMod, exists := h.assignments[sessionID]; exists {
		if h.isModeratorOnline(assignedMod) {
			return assignedMod
		}
	}

	// Least Connections: Count active rooms for all currently online moderators
	modCounts := make(map[string]int)
	for _, mod := range h.assignments {
		modCounts[mod]++
	}

	var bestModerator string
	minCount := -1

	// Iterate online clients to find the moderator/admin with the fewest active sessions
	for client := range h.clients {
		if client.Role == "moderator" || client.Role == "admin" || client.Role == "super_admin" {
			count := modCounts[client.Username]
			if minCount == -1 || count < minCount {
				minCount = count
				bestModerator = client.Username
			}
		}
	}

	// Persist and return the assignment
	if bestModerator != "" {
		h.assignments[sessionID] = bestModerator
		log.Printf("[Chat] Assigned session %s to Moderator %s (Active rooms: %d)", sessionID, bestModerator, minCount+1)
	}

	return bestModerator
}

// releaseModeratorAssignments unassigns all sessions managed by a moderator when they go offline.
func (h *Hub) releaseModeratorAssignments(modUsername string) {
	for sessionID, assignedMod := range h.assignments {
		if assignedMod == modUsername {
			delete(h.assignments, sessionID)
			log.Printf("[Chat] Released session %s as Moderator %s went offline", sessionID, modUsername)
		}
	}
}

// isModeratorOnline checks if a moderator is currently connected.
func (h *Hub) isModeratorOnline(username string) bool {
	for client := range h.clients {
		if (client.Role == "moderator" || client.Role == "admin" || client.Role == "super_admin") && client.Username == username {
			return true
		}
	}
	return false
}

// sendToModerator sends the message payload to all active online moderator clients.
func (h *Hub) sendToModerator(username string, message []byte) {
	for client := range h.clients {
		if client.Role == "moderator" || client.Role == "admin" || client.Role == "super_admin" {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client)
			}
		}
	}
}

// sendToGuest sends the message payload to the specific guest or user client.
func (h *Hub) sendToGuest(sessionID string, message []byte) {
	for client := range h.clients {
		if (client.Role == "guest" || client.Role == "user") && client.SessionID == sessionID {
			select {
			case client.Send <- message:
			default:
				close(client.Send)
				delete(h.clients, client)
			}
			return
		}
	}
}
