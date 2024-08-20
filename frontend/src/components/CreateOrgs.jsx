import {useState} from "react"

function CreateOrgs() {
    const [name,setName] = useState("");
    const [account,setAccount] = useState("");
    const [website,setWebsite] = useState("");
    const [fuelReimbursementPolicy,setFuelReimbursementPolicy] = useState("");
    const [speedLimitPolicy,setSpeedLimitPolicy] = useState("");
    const [parent,setParent] = useState("");

    async function handleClick() {
        try {
            const response = await fetch(`/Orgs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({parent,name,account,website,fuelReimbursementPolicy,speedLimitPolicy}),
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
                <input type="text" onChange={(e)=>setParent(e.target.value)} placeholder="Parent org name"/>
                <input type="text" onChange={(e)=>setName(e.target.value)} placeholder="Name"/>
                <input type="text" onChange={(e)=>setAccount(e.target.value)} placeholder="Account"/>
                <input type="text" onChange={(e)=>setWebsite(e.target.value)} placeholder="Website"/>
                <input type="text" onChange={(e)=>setFuelReimbursementPolicy(e.target.value)} placeholder="fuelReimbursementPolicy"/>
                <input type="text" onChange={(e)=>setSpeedLimitPolicy(e.target.value)} placeholder="speedLimitPolicy"/>
                <button onClick={()=>handleClick()}>Create Org</button>
            </div>
        </>
    );
}

export default CreateOrgs