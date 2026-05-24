.PHONY: build-CreateFunction build-RedirectFunction

build-CreateFunction:
	cd functions/create && GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o $(ARTIFACTS_DIR)/bootstrap .

build-RedirectFunction:
	cd functions/redirect && GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o $(ARTIFACTS_DIR)/bootstrap .
