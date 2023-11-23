FROM python:3.11

WORKDIR /app

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . .

EXPOSE 8080

ENV ENV=production

CMD uvicorn src.main:app --host 0.0.0.0 --port 8080
