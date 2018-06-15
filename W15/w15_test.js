function main()
{

    //volume data of lobster
    var volume = new KVS.LobsterData();

    //length
    var width = innerWidth*0.8;
    var height = innerHeight;

    //scene
    var scene = new THREE.Scene();

    //clock
    var clock = new THREE.Clock();

    //camera,light,renderer,trackball

    var max_range = volume.max_coord.clone().sub( volume.min_coord ).max();
    var center = volume.objectCenter();
    var fov = 45;
    var aspect = width / height;
    var near = 0.1;
    var far = max_range*100;

    var camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    camera.position.set(center.x+200, center.y, 70);
    camera.up.set( 0, 0, 1 );
    scene.add( camera );

    var light = new THREE.DirectionalLight( 0xffff55 );
    light.position.set(center.x, center.y, max_range * 2);
    scene.add( light );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );

    var trackball = new THREE.TrackballControls( camera, renderer.domElement );
    trackball.staticMoving = true;
    trackball.rotateSpeed = 3;
    trackball.radius = Math.min( width, height );
    trackball.target = center;
    trackball.noRotate = false;
    trackball.update();

    //box
    var bounds = Bounds( volume );
    // bounds.rotation.x = -Math.PI * 0.4;
    scene.add( bounds );

    //lobster
    var isovalue = 128;
    var surfaces = Isosurfaces( volume, isovalue );
    // surfaces.rotation.x = -Math.PI * 0.4;
    scene.add( surfaces );
    var original_position_z = surfaces.position.z;

    //ドーナツ
    // 芯円半径50、断面円半径10、断面円分割3、芯円分割16
    var torus = new THREE.Mesh(
        new THREE.TorusGeometry(10, 10, 3, 16), 
        new THREE.MeshLambertMaterial( { color: 0x00ff00 } )
    );
    torus.position.x += volume.resolution.x - 30;
    torus.position.y += volume.resolution.y/2 + 30;
    torus.position.z += volume.resolution.z/2;
    scene.add( torus );
    torus.visible = false;

    document.addEventListener( 'mousemove', function() {
        light.position.copy( camera.position );
    });


    /////////////////////////////////////////////////////////////////////////////

    // Load textures
    var loader = new THREE.TextureLoader();
    waterNormals = loader.load("waternormals.jpg");
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 

    // Create the water effect
    water = new THREE.Water( renderer, camera, scene, {
      textureWidth: 216,
      textureHeight: 216,
      waterNormals: waterNormals,
      distortionScale: 20,
      noiseScale: .5,
      alpha: .8,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x00dd00,
      side: THREE.DoubleSide,
    } );

    waterSurface = new THREE.Mesh(new THREE.PlaneGeometry( volume.resolution.x, volume.resolution.y, 70, 70 ),water.material);
    waterSurface.add(water);
    waterSurface.position.x = surfaces.position.x + volume.resolution.x/2;
    waterSurface.position.y = surfaces.position.y + volume.resolution.y/2;
    waterSurface.position.z = surfaces.position.z + volume.resolution.z-8;
    scene.add(waterSurface);

    ////////////////////////////////////////////////////////////////////////////////

    //user interface
    //水位変更
    var elem = document.querySelector('input[type="range"]');
    var rangeValue = function(){
        waterSurface.position.z = elem.value;
    }
    elem.addEventListener("input", rangeValue);

    //水の有無決定
    var outButton = document.querySelector('button[id="water_out_button"]');
    var outButtonPush = function(){
        if(waterSurface.visible == true){
            waterSurface.visible = false;
        }
    }   
    outButton.addEventListener("click", outButtonPush);

    var inButton = document.querySelector('button[id="water_in_button"]');
    var inButtonPush = function(){
        if(waterSurface.visible == false){
            waterSurface.visible = true;
        }
    }
    inButton.addEventListener("click", inButtonPush);

    //ロブスター操作

    var robsterOutButton = document.querySelector('button[id="robster_out_button"]');
    var robsterOutButtonPush = function(){
        if(surfaces.position.z == original_position_z){
            surfaces.position.z += (volume.resolution.z+30);
        }
    }   
    robsterOutButton.addEventListener("click", robsterOutButtonPush);

    var robsterInButton = document.querySelector('button[id="robster_in_button"]');
    var robsterInButtonPush = function(){
        if(surfaces.position.z != original_position_z){
            surfaces.position.z -= (volume.resolution.z+30);
        }
    }   
    robsterInButton.addEventListener("click", robsterInButtonPush);

    var robsterEatButton = document.querySelector('button[id="robster_eat_button"]');
    var robsterEatButtonPush = function(){
        if(surfaces.visible == true){
            surfaces.visible = false;
        }
    }   
    robsterEatButton.addEventListener("click", robsterEatButtonPush);

    var robsterPutButton = document.querySelector('button[id="robster_put_button"]');
    var robsterPutButtonPush = function(){
        if(surfaces.visible == false){
            surfaces.visible = true;
        }
    }   
    robsterPutButton.addEventListener("click", robsterPutButtonPush);

    var torusInButton = document.querySelector('button[id="torus_in_button"]');
    var torusInButtonPush = function(){
        if(torus.visible == false){
            torus.visible = true;
        }
    }   
    torusInButton.addEventListener("click", torusInButtonPush);

    var torusOutButton = document.querySelector('button[id="torus_out_button"]');
    var torusOutButtonPush = function(){
        if(torus.visible == true){
            torus.visible = false;
        }
    }   
    torusOutButton.addEventListener("click", torusOutButtonPush);

    loop();


    //loop
    function loop()
    {
        var elapsed = clock.getElapsedTime()
        requestAnimationFrame( loop );
        trackball.handleResize();
        water.render();
        renderer.render( scene, camera );
        trackball.update();
        water.material.uniforms.time.value = elapsed;   
    }
}
