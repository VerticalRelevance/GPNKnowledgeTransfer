FROM ubuntu:22.04

# Install dependencies
RUN apt update
RUN apt -y install python3 python3-pip

COPY requirements.txt  .
RUN  pip3 install -r requirements.txt --target "."

# Copy function code
RUN mkdir app
RUN cd app
COPY ./temp/* .

EXPOSE 80

# Run basic application
ENTRYPOINT ["python3"]
CMD ["app.py"]
