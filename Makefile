run:
	docker run --rm -p 80:5000 --name api --env-file .env romdmitriy/api
stop:
	docker stop api