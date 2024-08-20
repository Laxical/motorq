const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors())
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/vehicles', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB database successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const vehicleDataSchema = new mongoose.Schema({
    org: {
        type: String,
        required: true,
        unique: true,
    },
    vin: String,
    manufacturer: String,
    model: String,
    year: String,
});

const orgsDataSchema = new mongoose.Schema({
    parent: String,
    name: {
        type: String,
        required: true,
        unique: true,
    },
    account: String,
    website: String,
    fuelReimbursementPolicy: String,
    speedLimitPolicy: String,
});

const orgsData = mongoose.model('Orgsdata', orgsDataSchema);
const vehicleData = mongoose.model('Vehicledata', vehicleDataSchema);

app.get(`/vehicles/decode/:vin`, async (req,res) => {
    const vin = req.params.vin;
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`;
    let manufacturer='',model='',year='';

    try {
        const response = await fetch(url);
        const data = await response.json();

        data.Results.forEach(ele => {
            if(ele.Variable === "Make")
                manufacturer = ele.Value;
            else  if(ele.Variable === "Model")
                model = ele.Value;
            else if(ele.Variable === "Model Year") 
                year = ele.Value;
        });

        res.json({manufacturer: manufacturer, model: model, year: year});

    }
    catch(e) {
        console.error("Error fetching VIN data:", e);
        res.status(500).json({ error: "Failed to decode VIN" });
    }
});

app.post(`/vehicles`, async (req,res) => {
    const {vin,org} = req.body;

    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(vin)) {
        return res.status(400).json({ error: 'Invalid VIN.' });
    }
    else {
        let orgs;
        await orgsData.find({name:org}).then((data) => orgs = data)
        console.log(orgs);
    
        if(orgs.length === 0) {
            res.status(400).json({Error: "Org not in database!"});
        }
        else {
            await vehicleData.find({ $and: [ {org: org}, {vin: vin} ]})
                .then((data) => {
                    if(data == null) return res.status(400).json({error: "already present in database"});
                });
    
            try {
                const response = await fetch(`http://127.0.0.1:5000/vehicles/decode/${vin}`);
                const data = await response.json();
                const manufacturer = data.manufacturer;
                const model = data.model;
                const year = data.year;
    
                const newVehicleData = new vehicleData({
                    org: org,
                    vin: vin,
                    manufacturer: manufacturer,
                    model: model,
                    year: year,
                });
    
                await newVehicleData.save();
                res.status(200).json({org, vin, manufacturer, model, year});
    
            } catch(e) {
                console.error("Error fetching VIN data:", e);
                res.status(400).json({ error: "Invalid VIN!" });
            }
        }
    }
});

app.get(`/vehicles/:vin`, async (req,res) => {
    const vin = req.params.vin;

    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(vin)) {
        return res.status(400).json({ error: 'Invalid VIN.' });
    }
    else {
        try{
            let vehicle_data = null;
            await vehicleData.find({ vin: vin })
                .then((data) => {
                    vehicle_data = data;
                })
    
            res.json({vehicle_data: vehicle_data[0]});
    
        } catch(e) {
            console.error("Error fetching VIN data:", e);
            res.status(400).json({ error: "Invalid VIN" });
        }
    }
});

app.post(`/Orgs`, async(req,res) => {
    let {parent,name,account,website,fuelReimbursementPolicy=1000,speedLimitPolicy} = req.body;
    let orgs;
    await orgsData.find({name:name}).then((data) => orgs = data)

    if(orgs.length !== 0) {
        console.log("hit")
        res.status(400).json({Eror: "Org already exists!"})
    }
    else {
        await orgsData.find({name:parent}).then((data) => orgs = data)

        if(orgs.length === 0 && parent!="") res.status(400).json({Error: "specified parent org doesn't exist!"});
        else {
            if(parent==="") {
                parent = "none";
                if(fuelReimbursementPolicy==="") fuelReimbursementPolicy = 1000;
                if(speedLimitPolicy==="") speedLimitPolicy=20;
            }
            else {
                fuelReimbursementPolicy = orgs[0].fuelReimbursementPolicy;
                if(speedLimitPolicy === "") speedLimitPolicy = orgs[0].speedLimitPolicy;
            }
            
            try{
                const newOrgsData = new orgsData({
                    parent: parent,
                    name: name,
                    account: account,
                    website: website,
                    fuelReimbursementPolicy: fuelReimbursementPolicy,
                    speedLimitPolicy: speedLimitPolicy,
                });
                await newOrgsData.save();

                res.status(201).json({parent,name,account,website,fuelReimbursementPolicy,speedLimitPolicy});
            } catch(e) {
                res.status(400).json({error: "Org creation failed!"});
            }
        }
    }
});

app.patch(`/orgs`, async (req, res) => {
    let { org, account, website, fuelReimbursementPolicy, speedLimitPolicy } = req.body;

    try {
        let orgs;
        await orgsData.find({ name: org }).then((data) => orgs = data);

        if (orgs.length === 0) {
            return res.status(400).json({ error: `No org named ${org}` });
        } else {
            if(orgs[0].parent==="none" && orgs[0].fuelReimbursementPolicy !== fuelReimbursementPolicy && fuelReimbursementPolicy !== "") changeFuel(org);
            if(orgs[0].speedLimitPolicy !== speedLimitPolicy && speedLimitPolicy !== "") changeSpeed(org);
            if (account === "") account = orgs[0].account;
            if (website === "") website = orgs[0].website;
            if (fuelReimbursementPolicy === "" || orgs[0].parent !== "none") fuelReimbursementPolicy = orgs[0].fuelReimbursementPolicy;
            if (speedLimitPolicy === "") speedLimitPolicy = orgs[0].speedLimitPolicy;
            await orgsData.findOneAndUpdate({ name: org },{account: account,website: website,fuelReimbursementPolicy: fuelReimbursementPolicy,speedLimitPolicy: speedLimitPolicy});

            async function changeFuel(org_name) {
                let temp;
                await orgsData.find({parent: org_name}).then((data) => temp = data);
                for(let i=0;i<temp.length;i++){
                    await orgsData.updateOne({name: temp[i].name},{fuelReimbursementPolicy: fuelReimbursementPolicy});
                    changeFuel(temp[i].name);
                }
            }

            async function changeSpeed(org_name) {
                let temp;
                await orgsData.find({parent: org_name}).then((data) => temp = data);
                for(let i=0;i<temp.length;i++){
                    await orgsData.updateOne({name: temp[i].name},{speedLimitPolicy: speedLimitPolicy});
                    changeFuel(temp[i].name);
                }
            }

            res.status(200).json({ message: `Organization ${org} updated successfully.` });
        }
    } catch (e) {
        console.error("Error updating organization:", e);
        res.status(500).json({ error: "An error occurred while updating the organization." });
    }
});

app.get(`/orgs`, async(req,res) => {

});

app.listen(5000, () => {console.log("Server started on port 5000")});