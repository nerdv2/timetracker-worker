import {
    Router
} from 'itty-router'

// Create a new router
const router = Router()

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
}

// index route
router.get("/", () => {
    return new Response("Gema Wardian TimeTracker API.")
})


router.get("/api/time/retrieve", async request => {
    let result = {}

    result['status'] = false;

    const code = request.headers.get('Authorization');

    if (code) {
        const value = await timetrackerdata.get(code);

        if (value) {
            result['status'] = true;
            result['data'] = value;
        } else {
            result['message'] = "Data not found.";
        }
    } else {
        result['message'] = "Invalid code.";
    }

    const returnData = JSON.stringify(result, null, 2);
    return new Response(returnData, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": '86400'
        }
    })
})

router.get("/api/time/history", async request => {
    let result = {}

    result['status'] = false;

    const code = request.headers.get('Authorization');

    if (code) {
        const value = await timetrackerdata.get(code + "-history");

        if (value) {
            result['status'] = true;
            result['data'] = value;
        } else {
            result['message'] = "Data not found.";
        }
    } else {
        result['message'] = "Invalid code.";
    }

    const returnData = JSON.stringify(result, null, 2);
    return new Response(returnData, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": '86400'
        }
    })
})

router.post("/api/time/start", async request => {
    let result = {}
    result['status'] = false;

    const key = request.headers.get('Authorization');

    if (key) {
        let inputdata = {}
        const existvalue = await timetrackerdata.get(key);

        if (existvalue) {

            const jsondata = JSON.parse(existvalue)

            if (jsondata.status) {
                result['message'] = "Time already started"
            } else {
                inputdata['status'] = true
                inputdata['startdate'] = Date.now()

                timetrackerdata.put(key, JSON.stringify(inputdata, null, 2))
                result['status'] = true;
            }
        } else {
            inputdata['status'] = true
            inputdata['startdate'] = Date.now()
            timetrackerdata.put(key, JSON.stringify(inputdata, null, 2))
            result['status'] = true;
        }

    } else {
        result['message'] = "No auth header detected."
    }


    const returnData = JSON.stringify(result, null, 2);
    return new Response(returnData, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": '86400'
        }
    })
})

router.post("/api/time/stop", async request => {
    let result = {}
    result['status'] = false;

    const key = request.headers.get('Authorization');

    if (key) {
        let inputdata = {}
        const existvalue = await timetrackerdata.get(key);

        if (existvalue) {

            const jsondata = JSON.parse(existvalue)

            if (jsondata.status === false) {
                result['message'] = "Time already stopped"
            } else {
                inputdata['status'] = false
                inputdata['startdate'] = jsondata['startdate']
                inputdata['stopdate'] = Date.now()

                timetrackerdata.put(key, JSON.stringify(inputdata, null, 2))

                currdata = {}
                currdata['start'] = jsondata['startdate']
                currdata['stop'] = Date.now()

                arrayhistory = []
                arrayhistory.push(currdata)

                existinghistorydata = await timetrackerdata.get(key + "-history");

                if (existinghistorydata) {
                    existinghistoryjson = JSON.parse(existinghistorydata)

                    if (existinghistoryjson) {
                        existinghistoryjson.forEach(function(elem) {
                            arrayhistory.push(elem)
                        });
                    }
                }

                timetrackerdata.put(key + "-history", JSON.stringify(arrayhistory, null, 2))

                result['status'] = true;
            }
        }

    } else {
        result['message'] = "No auth header detected."
    }


    const returnData = JSON.stringify(result, null, 2);
    return new Response(returnData, {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": '86400'
        }
    })
})

router.all("*", () => new Response("404, not found!", {
    status: 404
}))

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    });
  }
}


addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method === 'OPTIONS') {
        event.respondWith(handleOptions(request));
    } else if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'POST') {
      // Handle requests to the API server
      event.respondWith(router.handle(event.request))
    } else {
      event.respondWith(
        new Response(null, {
          status: 405,
          statusText: 'Method Not Allowed',
        })
      );
    }
    
})