//Hlutir
var rammi, camera, renderer, scene, hammer, mixer, guy, hammered = false, playhammer = false;

//Aðal fallið sem keyrir allt
function Main() {
    clock = new THREE.Clock(); //Geymir tímann

    //Keyrir öll föllin
    Scene();
    Camera();
    Lighting();
    Objects();
    Renderer();
    LoadModel("models/dance.gltf");
    Animate();
}

//Nær í glTF model og setur það í senuna
function LoadModel(modelname){
    var loader = new THREE.GLTFLoader();

    //Loadar inn model-inu
    loader.load(modelname, function (gltf) {
        //Þegar model-ið er loadað, þá setum við það á rétta staðsetningu svo beint inn í senuna 
        guy = gltf.scene;
        guy.position.set(-3,-4, 0)
        scene.add(guy);

        //Nær í og geymir animationið
        mixer = new THREE.AnimationMixer(guy);
        gltf.animations.forEach((clip) => { mixer.clipAction(clip).play(); });
    });
}

//Keyrir animations
function Animate() {
    requestAnimationFrame(Animate); //Segir vafranum að uppfæra animation-ið fyrir næsta uppfærslu

    //Keyrir animation-ið á glTF model-inu
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    //Ef hamarinn hefur ekki verið hamraður
    if(!hammered && playhammer) {
        //Ef hann er ekki kominn á jörðu þá heldur hann áfram að snúa og færa sig niður
        if(hammer.rotation.z < Math.PI / 2) {
            hammer.translateY( -0.15 ); hammer.translateX( -0.15 );
            hammer.rotation.z += 0.15; 
        }
        //Ef hann er kominn á jörðu þá hverfur glTF model-ið
        else {
            guy.position.set(-3,-10, 0)
            hammered = true;
        }
    }
    //Ef hamarinn hefur verið hamraður
    if(!hammered && !playhammer) {
        //Ef hamarinn er ekki kominn í upphafstöðu þá heldur hann áfram að færa sig til baka
        if(hammer.rotation.z > 0.05) {
            hammer.translateY( 0.15 ); hammer.translateX( 0.15 );
            hammer.rotation.z -= 0.15; 
        }
        //Ef hamarinn er kominn aftur Í upphafstöðu þá kemur glTF model-ið aftur
        else{ guy.position.set(-3,-4, 0); hammer.position.set(0,0,0); }
    }
}

//Nær í ramman og býr til senu
function Scene(){
    //Nær í ramman í index.html
    rammi = document.getElementById("rammi");

    //Býr til senu og setur bakgrunn með lit
    scene            = new THREE.Scene();
    scene.background = new THREE.Color("#EDDDC0");
}

//Býr til myndavél sem hægt er að stjórna
function Camera(){
    camera = new THREE.PerspectiveCamera(70, rammi.clientWidth / rammi.clientHeight, 0.1, 100); //Býr til myndavél með FOV = 70, stærð af skjánum, og hægt er að horfa "100" áður enn hlutir hverfa.
    camera.position.set(0, 2.5, 10); //Myndavélin er staðsett aðeins upp og smá til baka.

    //Gefur notandanum stjórn á myndavélinni
    let controls = new THREE.OrbitControls(camera, rammi);
    controls.maxPolarAngle = Math.PI/2; controls.maxDistance = 30; //Takmarkar myndavélina (hún getur ekki farið undir jörðuna og getur ekki zoom-að of langt í burtu).
}
  
//Býr til ljós og setur það í senuna
function Lighting(){
    const DirectLight = new THREE.DirectionalLight("#ffffff", 2.5); DirectLight.position.set(2, 5, 7); //Beint ljós sem skýn beint á hamarinn
    const HemiLight   = new THREE.HemisphereLight("#ffffff", "#202020", 2);                            //Ljós fyrir ofan senuna

    //Bætir ljósunum inn í senuna
    scene.add(DirectLight, HemiLight);
}
  
//Býr til hluti og setur þá í senuna
function Objects(){
    //Býr til material sem notar texture
    const wood  = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("textures/wood.jpg")  });
    const metal = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("textures/metal.jpg") });
  
    //Býr til hluti með mismunandi stærðum textures/materials og setur staðsetningarnar
    let handle = new THREE.Mesh(new THREE.CylinderBufferGeometry(0.5, 0.5, 8, 8), wood);
    let head   = new THREE.Mesh(new THREE.BoxBufferGeometry(1.4, 1.4, 1.4),       metal); head.position.set(0,3,0);
    let neck   = new THREE.Mesh(new THREE.BoxBufferGeometry(3, 1, 1),             metal); neck.position.set(0,3,0);
    let face   = new THREE.Mesh(new THREE.CylinderBufferGeometry(1, 1, 1, 8),     metal); face.position.set(-1.5,3,0); face.rotateZ( Math.PI / 2 );
    let claw   = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 0.5, 1),           metal); claw.position.set(1.3,3.25,0);

    //Býr til gólf sem hamarinn og glTF model-ið stendur á
    let ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 0), new THREE.MeshStandardMaterial( { color: "#EDDDC0", side: THREE.DoubleSide } )); ground.rotateX(-Math.PI / 2); ground.position.set(0,-4,0);
  
    //Sameinar alla hamra-hlutina saman í group
    hammer = new THREE.Group();
    hammer.add(handle, head, neck, face, claw); 

    scene.add(hammer, ground); //Setur hamarinn og gólfið í senuna
}
  
//Býr til WebGLRenderer og setur hæð og breidd
function Renderer(){
    //Býr til renderer með antialias (gerir línur og enda sléttari)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    //Setur stærð renderer-sins við rammastærðina
    renderer.setSize (rammi.clientWidth, rammi.clientHeight);
    rammi.appendChild(renderer.domElement);
    
    //Lagar litina á skjánum
    renderer.gammaFactor = 2.2; renderer.gammaOutput = true;

    //Lætur ljós nota Lux, Candela og Lumens til að setja ljósin í senunar
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


Main(); //Keyrir forritið
