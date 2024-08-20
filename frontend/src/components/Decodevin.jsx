import { useState,useEffect,useRef} from "react";

function Decodevin() {
    const [vin,setVin] = useState("");
    const [manufacturer,setManufacturer] = useState("");
    const [model,setModel] = useState("");
    const [year,setYear] = useState("");
    const [requestCount, setRequestCount] = useState(0);
    const [lastRequestTime, setLastRequestTime] = useState(Date.now());

    async function handleClick() {
        const currTime = Date.now();

        if(currTime - lastRequestTime > 60000) {
            setRequestCount(0);
            setLastRequestTime(currTime);
        }

        if(requestCount >= 5) {
            alert("Too mant requests! try again after 1 min!");
        }
        else {
            try {
                const response = await fetch(`/vehicles/decode/${vin}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                console.log(response);
                let data = await response.json();
                console.log(data);

                setManufacturer(data.manufacturer);
                setModel(data.model);
                setYear(data.year);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
        
            } catch (error) {
                console.error('Error posting data:', error);
            }
            setRequestCount(requestCount+1);
        }
    }

    return(
        <>
            <div>
                <input type="text" onChange={(e)=>setVin(e.target.value)}/>
                <button onClick={() => handleClick()}>get Info</button>
                <div>Manufacturer: {manufacturer}</div>
                <div>model: {model}</div>
                <div>year: {year}</div>
            </div>
        </>
    );
}

export default Decodevin;