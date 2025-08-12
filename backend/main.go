package main

import (
    
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

type Product struct {
    ID       uint   `gorm:"primaryKey" json:"id"`
    Name     string `json:"name"`
    Price    int    `json:"price"`
    Color    string `json:"color"`
    Status   string `json:"status"` // available, import
    ImageURL string `json:"image_url"`
}

func main() {
    dsn := os.Getenv("DATABASE_DSN")
    if dsn == "" {
        dsn = "host=postgres user=postgres password=postgres dbname=sakifarm port=5432 sslmode=disable"
    }

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("DB connection failed:", err)
    }

    db.AutoMigrate(&Product{})

    r := gin.Default()

    r.GET("/api/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })

    r.GET("/api/products", func(c *gin.Context) {
        var products []Product
        db.Find(&products)
        c.JSON(200, products)
    })

    r.POST("/api/products", func(c *gin.Context) {
        var p Product
        if err := c.ShouldBindJSON(&p); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }
        db.Create(&p)
        c.JSON(201, p)
    })

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    r.Run(":" + port)
}
