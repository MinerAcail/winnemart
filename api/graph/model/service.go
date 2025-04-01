package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)


type Service struct {
	ID         uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	Name       string         `json:"name"`
	Type       string         `json:"type"`
	Number     string         `json:"number"`
	Email      string         `json:"email"`
	Profession pq.StringArray `gorm:"type:text[]" json:"profession,omitempty"`
	Password  *string    `json:"password,omitempty"`
	Dpfile    *string    `json:"dpfile,omitempty"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}
