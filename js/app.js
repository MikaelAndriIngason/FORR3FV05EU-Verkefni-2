//Hlutir
var rammi, camera, renderer, scene, hammer, mixer, guy, hammered = false, playhammer = false;

//Aðal fallið sem keyrir allt
function Main() {
    clock = new THREE.Clock();

    Scene();
    Camera();
    Lighting();
    Objects();
    Renderer();
    LoadModel("models/dance.gltf");
}

//Nær í glTF model og setur það í senuna
function LoadModel(modelname){
    var loader = new THREE.GLTFLoader();

    loader.load(modelname, function (gltf) {
        guy = gltf.scene;
        guy.position.set(-3,-4, 0)
        scene.add(guy);

        mixer = new THREE.AnimationMixer(guy);
        gltf.animations.forEach( ( clip ) => { mixer.clipAction( clip ).play(); });
    });
}

function Animate() {
    requestAnimationFrame(Animate);
    var delta = clock.getDelta();
    
    if (mixer) mixer.update(delta);
  
    renderer.render(scene, camera);

    if(!hammered && playhammer) {
        if(hammer.rotation.z < Math.PI / 2) {
            hammer.translateY( -0.15 ); hammer.translateX( -0.15 );
            hammer.rotation.z += 0.15; 
        }
        else {
            guy.position.set(-3,-10, 0)
            hammered = true;
        }
    }
    if(!hammered && !playhammer) {
        if(hammer.rotation.z > 0.05) {
            hammer.translateY( 0.15 ); hammer.translateX( 0.15 );
            hammer.rotation.z -= 0.15; 
        }
        else{ guy.position.set(-3,-4, 0); hammer.position.set(0,0,0); }
    }
}

//Nær æi ramman og býr til senu
function Scene(){
    //Nær í ramman
    rammi = document.getElementById("rammi");

    //Býr til senu og setur bakgrunn með lit
    scene            = new THREE.Scene();
    scene.background = new THREE.Color("#EDDDC0");
}

//Býr til myndavél sem hægt er að stjórna
function Camera(){
    camera = new THREE.PerspectiveCamera(70, rammi.clientWidth / rammi.clientHeight, 0.1, 100); //Býr til myndavél með FOV = 70, stærð af skjánum, og hægt er að horfa "100" áður enn hlutir hverfa.
    camera.position.set(0, 2.5, 10);                                                            //Myndavélin er staðsett aðeins upp og smá til baka.

    //Gefur notandanum stjórn á myndavélinni
    let controls = new THREE.OrbitControls(camera, rammi);
    controls.maxPolarAngle = Math.PI/2; controls.maxDistance = 30; //Takmarkar myndavélina (hún getur ekki farið undir jörðuna og getur ekki zoom-að of langt í burtu).
}
  
//Býr til ljós og setur það í senuna
function Lighting(){
    const DirectLight = new THREE.DirectionalLight("#ffffff", 2.5); DirectLight.position.set(2, 5, 7); DirectLight.castShadow = true;
    const HemiLight   = new THREE.HemisphereLight("#ddeeff", "#202020", 2); HemiLight.castShadow = true;

    scene.add(DirectLight, HemiLight);
}
  
//Býr til hluti og setur þá í senuna
function Objects(){
    const textureLoader = new THREE.TextureLoader();

    //Býr til material sem notar texture
    const wood  = new THREE.MeshStandardMaterial({ map: textureLoader.load("textures/wood.jpg")  });
    const metal = new THREE.MeshStandardMaterial({ map: textureLoader.load("textures/metal.jpg") });
  
    //Býr til hluti með textures/materials og setur staðsetningarnar
    let handle = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 8, 1),       wood);
    let head   = new THREE.Mesh(new THREE.BoxBufferGeometry(1.4, 1.4, 1.4), metal); head.position.set(0,3,0);
    let neck   = new THREE.Mesh(new THREE.BoxBufferGeometry(3, 1, 1),       metal); neck.position.set(0,3,0);
    let face   = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1.5, 1.5),   metal); face.position.set(-1.5,3,0);
    let claw   = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 0.5, 1),     metal); claw.position.set(1.3,3.25,0);

    let ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshStandardMaterial( { color: "#EDDDC0", side: THREE.DoubleSide } )); ground.rotateX(-Math.PI / 2); ground.position.set(0,-4,0);
  
    //Sameinar hlutina saman í group
    hammer = new THREE.Group();
    hammer.add(handle, head, neck, face, claw); 

    scene.add(hammer, ground); //Setur hlutina í senuna
}
  
//Býr til WebGLRenderer og setur hæð og breidd
function Renderer(){
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize (rammi.clientWidth, rammi.clientHeight);
    rammi.appendChild(renderer.domElement);
    
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;

    renderer.physicallyCorrectLights = true;
  
    //Kveikir á animation loop
    renderer.setAnimationLoop(() => { update(); renderer.render(scene, camera); });
}

//Aðlagar senuna að nýu skjástærðinni
function AdjustWindow() {
    //Lagar stærð myndavélanar miðað við skjástærð
    camera.aspect = rammi.clientWidth / rammi.clientHeight; 
    camera.updateProjectionMatrix();
    
    //Breytir stærð render-ins og canvas-ins
    renderer.setSize (rammi.clientWidth, rammi.clientHeight);   
}
window.addEventListener("resize", AdjustWindow); //Ef skjástærðin breytist


//Ef notandinn ýtir á "Hammer Time" takkan þá spilast animation-ið
function HammerTime()  { playhammer = true; }
//Ef notandinn ýtir á "Reset" takkan þá fer hamarinn aftur í stað
function ResetHammer() { hammered  = false; playhammer = false;}

function update() {}


Main();    //Keyrir forritið
Animate(); //Keyrir animations