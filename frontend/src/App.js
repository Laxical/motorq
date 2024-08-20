import Decodevin from "./components/Decodevin.jsx"
import AddVehicle from "./components/AddVehicle.jsx";
import VinDetails from "./components/VinDetails.jsx"
import CreateOrgs from "./components/CreateOrgs.jsx";
import UpdateOrgInfo from "./components/UpdateOrgInfo.jsx";
import { Routes, Route } from "react-router-dom"

function App() {
  return(
    <>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/decodevin" element={<Decodevin/>} />
        <Route path="/addvehicles" element={<AddVehicle/>} />
        <Route path="/vindetails" element={<VinDetails/>} />
        <Route path="/createorgs" element={<CreateOrgs/>} />
        <Route path="/updateorgs" element={<UpdateOrgInfo/>} />
      </Routes>
    </>
  );
}

export default App