FROM golang:1.22.5-alpine AS build
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=build /app/main .
EXPOSE 8080
CMD ["./main"]
