const PingpongService = {
    Ping: (call: any, callback: any) => {
        console.log("Received:", call.request.message);
        callback(null, { message: call.request.message });
    },
};

export default PingpongService;
