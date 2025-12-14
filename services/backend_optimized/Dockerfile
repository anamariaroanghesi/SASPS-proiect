FROM python:3.12.3
COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt
COPY /src /app
WORKDIR /app
EXPOSE 5000
CMD ["python", "main.py"]