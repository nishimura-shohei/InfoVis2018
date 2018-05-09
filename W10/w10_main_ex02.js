function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();

    screen.init( volume, {
        width: window.innerWidth,
        height: window.innerHeight,
        enableAutoResize: false
    });

    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    var material.color = new THREE.Color(0xff0000);
    
    screen.scene.add( material );
    
    var isovalue = 128;
    var surfaces = Isosurfaces( volume, isovalue );
    screen.scene.add( surfaces );

    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });
    
    

    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth, window.innerHeight ] );
    });

    screen.loop();
}
