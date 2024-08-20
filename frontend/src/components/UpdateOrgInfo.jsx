import {useState} from "react"

function UpdateOrgInfo() {
    const [org,setOrg] = useState("");
    const [account,setAccount] = useState("");
    const [website,setWebsite] = useState("");
    const [fuelReimbursementPolicy,setFuelReimbursementPolicy] = useState("");
    const [speedLimitPolicy,setSpeedLimitPolicy] = useState("");

    async function handleClick() {
        console.log("in");
        try {
            const response = await fetch(`/orgs`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({org,account,website,fuelReimbursementPolicy,speedLimitPolicy}),
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
            <input type="text" onChange={(e)=>setOrg(e.target.value)} placeholder="org name"/>
            <input type="text" onChange={(e)=>setAccount(e.target.value)} placeholder="account change field"/>
            <input type="text" onChange={(e)=>setWebsite(e.target.value)} placeholder="website change field"/>
            <input type="text" onChange={(e)=>setFuelReimbursementPolicy(e.target.value)} placeholder="fuel change field"/>
            <input type="text" onChange={(e)=>setSpeedLimitPolicy(e.target.value)} placeholder="speedlimit change field"/>
            <button onClick={handleClick}>Update org info</button>
        </>
    );
}

export default UpdateOrgInfo