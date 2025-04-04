# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc
import warnings

from . import job_pb2 as job__pb2

GRPC_GENERATED_VERSION = '1.64.0'
GRPC_VERSION = grpc.__version__
EXPECTED_ERROR_RELEASE = '1.65.0'
SCHEDULED_RELEASE_DATE = 'June 25, 2024'
_version_not_supported = False

try:
    from grpc._utilities import first_version_is_lower
    _version_not_supported = first_version_is_lower(GRPC_VERSION, GRPC_GENERATED_VERSION)
except ImportError:
    _version_not_supported = True

if _version_not_supported:
    warnings.warn(
        f'The grpc package installed is at version {GRPC_VERSION},'
        + f' but the generated code in job_pb2_grpc.py depends on'
        + f' grpcio>={GRPC_GENERATED_VERSION}.'
        + f' Please upgrade your grpc module to grpcio>={GRPC_GENERATED_VERSION}'
        + f' or downgrade your generated code using grpcio-tools<={GRPC_VERSION}.'
        + f' This warning will become an error in {EXPECTED_ERROR_RELEASE},'
        + f' scheduled for release on {SCHEDULED_RELEASE_DATE}.',
        RuntimeWarning
    )


class JobStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.CreateJob = channel.unary_unary(
                '/job.Job/CreateJob',
                request_serializer=job__pb2.CreateJobRequest.SerializeToString,
                response_deserializer=job__pb2.JobResponse.FromString,
                _registered_method=True)
        self.GetJob = channel.unary_unary(
                '/job.Job/GetJob',
                request_serializer=job__pb2.GetJobRequest.SerializeToString,
                response_deserializer=job__pb2.JobResponse.FromString,
                _registered_method=True)
        self.ListJobs = channel.unary_unary(
                '/job.Job/ListJobs',
                request_serializer=job__pb2.ListJobsRequest.SerializeToString,
                response_deserializer=job__pb2.ListJobsResponse.FromString,
                _registered_method=True)
        self.UpdateJob = channel.unary_unary(
                '/job.Job/UpdateJob',
                request_serializer=job__pb2.UpdateJobRequest.SerializeToString,
                response_deserializer=job__pb2.JobResponse.FromString,
                _registered_method=True)


class JobServicer(object):
    """Missing associated documentation comment in .proto file."""

    def CreateJob(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def GetJob(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def ListJobs(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')

    def UpdateJob(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_JobServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'CreateJob': grpc.unary_unary_rpc_method_handler(
                    servicer.CreateJob,
                    request_deserializer=job__pb2.CreateJobRequest.FromString,
                    response_serializer=job__pb2.JobResponse.SerializeToString,
            ),
            'GetJob': grpc.unary_unary_rpc_method_handler(
                    servicer.GetJob,
                    request_deserializer=job__pb2.GetJobRequest.FromString,
                    response_serializer=job__pb2.JobResponse.SerializeToString,
            ),
            'ListJobs': grpc.unary_unary_rpc_method_handler(
                    servicer.ListJobs,
                    request_deserializer=job__pb2.ListJobsRequest.FromString,
                    response_serializer=job__pb2.ListJobsResponse.SerializeToString,
            ),
            'UpdateJob': grpc.unary_unary_rpc_method_handler(
                    servicer.UpdateJob,
                    request_deserializer=job__pb2.UpdateJobRequest.FromString,
                    response_serializer=job__pb2.JobResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'job.Job', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))
    server.add_registered_method_handlers('job.Job', rpc_method_handlers)


 # This class is part of an EXPERIMENTAL API.
class Job(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def CreateJob(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/job.Job/CreateJob',
            job__pb2.CreateJobRequest.SerializeToString,
            job__pb2.JobResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def GetJob(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/job.Job/GetJob',
            job__pb2.GetJobRequest.SerializeToString,
            job__pb2.JobResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def ListJobs(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/job.Job/ListJobs',
            job__pb2.ListJobsRequest.SerializeToString,
            job__pb2.ListJobsResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)

    @staticmethod
    def UpdateJob(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(
            request,
            target,
            '/job.Job/UpdateJob',
            job__pb2.UpdateJobRequest.SerializeToString,
            job__pb2.JobResponse.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
            _registered_method=True)
