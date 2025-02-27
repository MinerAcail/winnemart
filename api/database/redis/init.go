package redis

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func ConfigureRedis() *redis.Client {
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")

	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password: "", // No password set
		DB:       0,  // Use default DB
	})

	// Test the connection
	fmt.Println("Attempting to connect to Redis...")
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Could			 not connect to Redis: %v", err)
	} else {
		fmt.Println("Successfully connected to Redis!")
	}
	return rdb
}

func writeTempFile(data []byte, prefix string) (string, error) {
	tmpfile, err := ioutil.TempFile("", prefix)
	if err != nil {
		return "", fmt.Errorf("error creating temp file: %w", err)
	}

	if _, err := tmpfile.Write(data); err != nil {
		tmpfile.Close()
		os.Remove(tmpfile.Name())
		return "", fmt.Errorf("error writing to temp file: %w", err)
	}

	if err := tmpfile.Close(); err != nil {
		os.Remove(tmpfile.Name())
		return "", fmt.Errorf("error closing temp file: %w", err)
	}

	return tmpfile.Name(), nil
}
