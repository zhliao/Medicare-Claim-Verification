const Organizations = artifacts.require("Organizations");
const ServiceClaim = artifacts.require("ServiceClaim");
const AEECToken = artifacts.require("AEECToken");
const orgArtifact = require("./../client/src/contracts/Organizations.json");
const tokenArtifact = require("./../client/src/contracts/AEECToken.json");
const Insurer = artifacts.require("Insurer");
const Provider = artifacts.require("Provider");
const Patient = artifacts.require("Patient");


let organizationsInstance;
let insurer; 
let insurerID; 
let provider;
let providerID; 
let patient; 
let patientID; 
let patientActual;


contract('Organizations', (accounts) => {
  
  describe('Basic Organization Tests', async () => {
    before(async function(){
      var aeecToken = await AEECToken.deployed(); // contract(tokenArtifact); // AEECToken.deployed();
      console.log(aeecToken.address);
      var organizationsInstance = await Organizations.deployed();
      console.log(organizationsInstance.address);
    });
  
    it('Organization Contract is properly deployed', async () => {
      const organizationsInstance = await Organizations.deployed();
      const oAddress = organizationsInstance.address; 
      assert(oAddress, "Organization address does not exist");
    });


    it('Insurer Contract is properly deployed', async () => {
      const insurerInstance = await Insurer.deployed();
      const insurerAddress = insurerInstance.address; 
      assert(insurerAddress, "Insurer address does not exist");
    });

    it('Provider Contract is properly deployed', async () => {
      const insurerInstance = await Insurer.deployed();
      const providerTx = await insurerInstance.addProvider("Anthem Blue Cross"); 
      console.log("Provider Address: ", providerTx.logs[0].args.addr) 
      const providerInstance = await Provider.at(providerTx.logs[0].args.addr);
      const providerAddress = providerInstance.address; 
      assert(providerAddress, "Provider address does not exist");
    });

    it('Patient Contract is properly deployed', async () => {
      const insurerInstance = await Insurer.deployed();
      const providerTx = await insurerInstance.addProvider("Anthem Blue Cross"); 
      console.log("Provider Address: ", providerTx.logs[0].args.addr) 
      const providerInstance = await Provider.at(providerTx.logs[0].args.addr);
      const patientTx = await providerInstance.addPatient("Ken");
      console.log("Patient Address: ", patientTx.logs[0].args.addr);
      const patientInstance = await Patient.at(patientTx.logs[0].args.addr);
      const patientAddress = patientInstance.address;
      assert(patientAddress, "Patient address does not exist");
    });

    it('Correctly added Provider to Insurer', async () => {
      const insurerInstance = await Insurer.deployed();
      const providerTx = await insurerInstance.addProvider("Anthem Blue Cross"); 
      console.log("Provider Address: ", providerTx.logs[0].args.addr) 
      const pName = await insurerInstance.providerMap(providerTx.logs[0].args.addr);
      assert.equal("Anthem Blue Cross", pName, "Provider name does not matche given input");
    });
  

    // TODO -- Add Patient to Provider --> May need to check depths ? 
    // it('Correctly added Insurer to Organizations', async () => {
    //   const organizationsInstance = await Organizations.deployed();
    //   const insurerID = await organizationsInstance.addInsurer("CMS"); 
      
    //   const insurerStruct = await organizationsInstance.insurerMap(insurerID.logs[0].args.id);
      
    //   assert.equal("CMS", insurerStruct.name, "Insurer name does not matche given input");
    //   });
    
    // it('Correctly added Provider to Organization', async () => {
    //   const organizationsInstance = await Organizations.deployed();
    //   const insurer =  await organizationsInstance.addInsurer("CMS");
    //   const insurerID = insurer.logs[0].args.id;
    //   const provider = await organizationsInstance.addProvider("Anthem Blue Cross",insurerID);
    //   const providerID = provider.logs[0].args.id;
    //   const providerActual = await organizationsInstance.providerMap(providerID);
    //   //console.log(providerName);
    //   assert.equal("Anthem Blue Cross",providerActual.name, "provider name does not match input name");
    //   assert.equal(providerID,providerActual.id,"id of providers do not match here");
    // })
  
  //   it('Correctly added a Patient to the Organization', async() => {
  //     const organizationsInstance = await Organizations.deployed();
  //     const insurer =  await organizationsInstance.addInsurer("CMS");
  //     const insurerID = insurer.logs[0].args.id;
  //     const provider = await organizationsInstance.addProvider("Anthem Blue Cross",insurerID);
  //     const providerID = provider.logs[0].args.id;
  //     const patient = await organizationsInstance.addPatient("Antonio",providerID);
  //     const patientID = await patient.logs[0].args.id;
  //     const patientActual = await organizationsInstance.patientMap(patientID);
  //     assert.equal("Antonio",patientActual.name,"patient name does not match actual name");
  //   });
  });
	

  describe('Service claim related features', async() => {
    before(async() =>{
      insurerInstance = await Insurer.deployed();
      provider = await insurerInstance.addProvider("Anthem Blue Cross");
      providerAddr = provider.logs[0].args.addr;
      providerInstance = await Provider.at(providerAddr);
      patient = await providerInstance.addPatient("Antonio");
      patientAddr = await patient.logs[0].args.addr;
      patientInstance = await Patient.at(patientAddr);
    });

    it('Correctly instantiate ServiceClaim', async() => {
      //console.log(providerInstance);
      const serviceClaimTx = await providerInstance.provideService("Glasses",patientInstance.address);    
      //console.log("SERVICE CLAIM LOGS: ", serviceClaimTx.logs)
      const serviceClaimInstance = await ServiceClaim.at(serviceClaimTx.logs[0].args.addr);
      //const serviceClaimID = await serviceClaimTx.logs[0].args.addr;
      //const serviceClaimActual = await organizationsInstance.serviceClaimsMap(serviceClaimID);
      //console.log("SC Instance: ", serviceClaimInstance);
      assert(serviceClaimInstance.address,"Address found");
    });
    
    it('Correctly adds a claim amount', async() => {

      //console.log(providerInstance);
      const serviceClaimTx = await providerInstance.provideService("Glasses",patientInstance.address);    
      //console.log("SERVICE CLAIM LOGS: ", serviceClaimTx.logs)
      const serviceClaimInstance = await ServiceClaim.at(serviceClaimTx.logs[0].args.addr);
      const fileClaimTx = await serviceClaimInstance.fileClaim(100, Date.now());
      const claimAmount = await serviceClaimInstance.getAmount();
      assert.equal(100,claimAmount,"Claim Amount is Incorrect");
    });
  
  
  it('Correctly verifies a claim', async() => {

    const serviceClaimTx = await providerInstance.provideService("Glasses",patientInstance.address);    
    //console.log("SERVICE CLAIM LOGS: ", serviceClaimTx.logs)
    const scAddr = serviceClaimTx.logs[0].args.addr
    const serviceClaimInstance = await ServiceClaim.at(scAddr);
    await serviceClaimInstance.fileClaim(100, Date.now());
    //const patientInstance = await Patient.at(patientInstance.address);
    const verifyTx = await patientInstance.verifyClaim(scAddr, Date.now(), true);
    const claimVerify = await serviceClaimInstance.isVerified();
    console.log("VERIFY TX: ", claimVerify);
    assert.equal(true,claimVerify,"Claim Verification is Incorrect");
  });


  // TODO -- Implement the Payment of a Patient!!! 
  // it('Confirms payment completion of the claim', async() => {
  //   const serviceClaim = await organizationsInstance.provideService("Glasses",providerID,patientID);
  //   const serviceClaimInfo = await serviceClaim.logs[0].args;
  //   await organizationsInstance.payProvider(serviceClaimInfo.ID);
  //   const currService = await ServiceClaim.at(serviceClaimInfo.addr);
  //   const claimPaid = await currService.isPaid();
  //   assert.equal(true,claimPaid,"Claim Verification is Incorrect");
  // });
});

  describe('Organization Association Tests', async() => {
    before(async() =>{
      insurerInstance = await Insurer.deployed();
      provider = await insurerInstance.addProvider("Anthem Blue Cross");
      providerAddr = provider.logs[0].args.addr;
      providerInstance = await Provider.at(providerAddr);
      patient = await providerInstance.addPatient("Antonio");
      patientAddr = await patient.logs[0].args.addr;
      patientInstance = await Patient.at(patientAddr);
    });

    //Insurer Provider - DONE
    it('Empty Insurer Provider  List', async () => {
      var pL = await insurerInstance.getProviders();
      console.log("Providers: ", pL);
      //var insurerList = iL.logs[0].args.ids.length;
      assert.equal(pL.length,0,"Insurer list is not empty");
    });

    it('Single Insurer Provider List', async () => {
      await organizationsInstance.addProvider("Anthem Blue Cross",insurerID);
      var iL = await organizationsInstance.providersOfInsurer(insurerID);
      var insurerList = iL.logs[0].args.ids.length;
      assert.equal(insurerList,1,"Insurer list should have a member here as well");
    });

    //Provider Patient - DONE
    it('Empty Provider Patient List', async () => {
      const provider = await organizationsInstance.addProvider("Anthem Blue Cross",insurerID);
      const providerID = provider.logs[0].args.id;

      var pL = await organizationsInstance.patientsOfProvider(providerID);
      var patientsList = pL.logs[0].args.ids.length;
      assert.equal(patientsList, 0, "Patients list not empty");
    });

    it('Single Provider Patient List', async () => {
      const provider = await organizationsInstance.addProvider("Anthem Blue Cross",insurerID);
      const providerID = provider.logs[0].args.id;

      await organizationsInstance.addPatient("Antonio",providerID);
      var pL = await organizationsInstance.patientsOfProvider(providerID);
      var patientsList = pL.logs[0].args.ids.length;
      assert.equal(patientsList,1,"Patients list should have a member here");
    });
  });

  describe('Service claim verified and unverified list tests',async() =>{
    before(async() =>{
      insurerInstance = await Insurer.deployed();
      provider = await insurerInstance.addProvider("Anthem Blue Cross");
      providerAddr = provider.logs[0].args.addr;
      providerInstance = await Provider.at(providerAddr);
      patient = await providerInstance.addPatient("Antonio");
      patientAddr = await patient.logs[0].args.addr;
      patientInstance = await Patient.at(patientAddr);
    });

    it('Empty Unverified Claims List', async() => {
      const organizationsInstance = await Organizations.deployed();

      const unvServices = await organizationsInstance.patientUnverifiedClaims(patientID);
      const unverifiedServices = unvServices.logs[0].args.services.length;

      assert.equal(unverifiedServices,0,"There should be no unverified services here");
    });

    //
    it('Single Unclaimed Service List', async() => {
      const organizationsInstance = await Organizations.deployed();

      await organizationsInstance.provideService("Glasses",providerID,patientID);

      const uvS = await organizationsInstance.patientUnclaimedServices(patientID);
      const unclaimedServices = uvS.logs[0].args.services.length;
      
      assert.equal(unclaimedServices,1,"There should be an unverified service here");
    });

    it('Single Unverified Claims List', async() => {
      const organizationsInstance = await Organizations.deployed();
      const serviceClaim = await organizationsInstance.provideService("Glasses",providerID,patientID);    
      const serviceClaimInfo = await serviceClaim.logs[0].args;
      //console.log("BEFORE FILE CLAIM");
      const addServiceClaim = await organizationsInstance.fileClaim(serviceClaimInfo.ID, 100);
      const uvS = await organizationsInstance.patientUnverifiedClaims(patientID);
      const unverifiedServices = uvS.logs[0].args.services.length;
      
      assert.equal(unverifiedServices,1,"There should be an unverified service here");
    });

    it('Empty Verified Claims List Test', async() => {
      const organizationsInstance = await Organizations.deployed();
      
      const vServices = await organizationsInstance.patientVerifiedClaims(patientID);
      const verifiedServices = vServices.logs[0].args.services.length;
      
      assert.equal(verifiedServices,0,"There should be no verified services here");
    });

    //
    it('Single Verified Claims List', async() =>{
      const organizationsInstance = await Organizations.deployed();

      const serviceClaim = await organizationsInstance.provideService("Glasses",providerID,patientID);    
      const serviceClaimInfo = await serviceClaim.logs[0].args;
      console.log("ID: ", serviceClaimInfo)
      const SCAddress = await organizationsInstance.serviceClaimsMap(serviceClaimInfo.ID);

      await organizationsInstance.verifyClaim(SCAddress);

      const vServices = await organizationsInstance.patientVerifiedClaims(patientID);
      const verifiedServices = vServices.logs[0].args.services.length;

      assert.equal(verifiedServices,1,"There should be a verified service here");
    });
  });

  describe('Integrates AEECToken Contract Properly', async() =>{
    before(async function(){
      insurerInstance = await Insurer.deployed();
      provider = await insurerInstance.addProvider("Anthem Blue Cross");
      providerAddr = provider.logs[0].args.addr;
      providerInstance = await Provider.at(providerAddr);
      patient = await providerInstance.addPatient("Antonio");
      patientAddr = await patient.logs[0].args.addr;
      patientInstance = await Patient.at(patientAddr);      
      tokenInstance = await AEECToken.deployed();
    });

    it('Organizations properly mints AEECToken', async() => {
      //const token = await organizationsInstance.getToken();
      const tokenBalance = await tokenInstance.balanceOf(organizationsInstance.address);
      assert.equal(tokenBalance,1000000);
    });
  });
});