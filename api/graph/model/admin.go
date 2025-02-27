package model

import (
	"time"

	"github.com/google/uuid"
)

type Admin struct {

	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`

	Name      string     `json:"name"`
	Type      string     `json:"type"`
	Number    string     `json:"number"`
	Password  *string    `json:"password,omitempty"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}
type JobRequest struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	Type       string     `json:"type"`
	Number     string     `json:"number"`
	State       string     `json:"state"`
	Password  *string    `json:"password,omitempty"`

	Experience string     `json:"experience"`
	CreatedAt  *time.Time `json:"createdAt,omitempty"`
	UpdatedAt  *time.Time `json:"updatedAt,omitempty"`
}