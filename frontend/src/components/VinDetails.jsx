import {useState} from "react"

function VinDetails() {
    const [vin,setVin] = useState("");

    async function handleClick() {
        try {
            const response = await fetch(`/vehicles/${vin}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            let data = await response.json();
            console.log(data);

            console.log(data.vehicle_data.org)
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
        } catch (error) {
            console.error('Error posting data:', error);
        }
    }

    return(
        <>
            <input type="text" onChange={(e) => setVin(e.target.value)}/>
            <button onClick={() => handleClick()}>Get Info</button>
        </>
    );
}

export default VinDetails