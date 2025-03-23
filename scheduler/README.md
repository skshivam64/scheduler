# Create a Python virtaul environment for the scheduler.

python3 -m venv scheduler-env

# Activate the virtual environment

source scheduler-env/bin/activate

# Install dependencies

pip install -r requirements.txt

Generating python protobuf files.
python -m grpc_tools.protoc -I=. --python_out=. --grpc_python_out=. schedule.proto
python -m grpc_tools.protoc -I=. --python_out=. --grpc_python_out=. job.proto
