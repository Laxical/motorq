import { useState,useEffect,useRef} from "react";

function AddVehicle() {
    const [vin,setVin] = useState("");
    const [org,setOrg] = useState("");

    async function handleClick() {
        try {
            const response = await fetch(`/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({vin,org}),
            });
            console.log(response);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

        } catch (error) {
            console.error('Error posting data:', error);
        }
    }

    return(
        <>
            <div>
                <input type="text" onChange={(e)=>{setVin(e.target.value);}}/>
                <input type="text" onChange={(e)=>{setOrg(e.target.value)}}/>
                <button onClick={()=>handleClick()}>add Vehicle</button>
            </div>
        </>
    );
}

export default AddVehicle