import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  standalone: true
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('earthCanvas', { static: true }) earthCanvas!: ElementRef<HTMLCanvasElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private earth!: THREE.Mesh;
  private clouds!: THREE.Mesh;
  private atmosphere!: THREE.Mesh;
  private galaxy!: THREE.Mesh;
  // private electrons!: THREE.Group; // Electron system removed
  // private electronOrbits!: THREE.Group; // Electron system removed
  private animationId!: number;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createGalaxyBackground();
    this.createEarth();
    this.createClouds();
    this.createAtmosphere();
    this.addLighting();
    this.animate();
    this.createHTMLStars(); // Add HTML/CSS stars
    
    // Add window resize listener
    window.addEventListener('resize', () => this.onWindowResize());
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Remove window resize listener
    window.removeEventListener('resize', () => this.onWindowResize());
    
    // Nettoyer les géométries et matériaux
    if (this.earth) {
      this.earth.geometry.dispose();
      if (this.earth.material instanceof THREE.Material) {
        this.earth.material.dispose();
      }
    }
    if (this.clouds) {
      this.clouds.geometry.dispose();
      if (this.clouds.material instanceof THREE.Material) {
        this.clouds.material.dispose();
      }
    }
    if (this.atmosphere) {
      this.atmosphere.geometry.dispose();
      if (this.atmosphere.material instanceof THREE.Material) {
        this.atmosphere.material.dispose();
      }
    }
    if (this.galaxy) {
      this.galaxy.geometry.dispose();
      if (this.galaxy.material instanceof THREE.Material) {
        this.galaxy.material.dispose();
      }
    }
    // Electron cleanup removed - electron system no longer exists
  }

  private initThreeJS(): void {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.earthCanvas.nativeElement.clientWidth / this.earthCanvas.nativeElement.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 12); // Move camera further back for bigger Earth
    this.camera.lookAt(0, 0, 0); // Make sure camera looks at Earth
    console.log('Camera positioned at:', this.camera.position);
    console.log('Camera looking at origin where Earth should be');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.earthCanvas.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(
      this.earthCanvas.nativeElement.clientWidth,
      this.earthCanvas.nativeElement.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private createEarth(): void {
    const geometry = new THREE.SphereGeometry(4.0, 128, 128); // Increased size to be more visible
    
    // Create realistic Earth texture
    const earthTexture = this.createRealisticEarthTexture();
    const normalMap = this.createEarthNormalMap();
    const specularMap = this.createSpecularMap();

    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      specularMap: specularMap,
      shininess: 100,
      transparent: false
    });

    this.earth = new THREE.Mesh(geometry, material);
    // Ensure Earth is at the center and visible
    this.earth.position.set(0, 0, 0);
    this.scene.add(this.earth);
    
    console.log('Earth created with radius 4.0 at position:', this.earth.position);
  }  private createRealisticEarthTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Create realistic ocean base with depth variations
    const oceanGradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1024);
    oceanGradient.addColorStop(0, '#1a472a');
    oceanGradient.addColorStop(0.3, '#1e40af');
    oceanGradient.addColorStop(0.6, '#1d4ed8');
    oceanGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add ocean depth variations
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 100 + 50;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(30, 64, 175, 0.3)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Africa - detailed shape and realistic colors
    ctx.fillStyle = '#16a34a'; // Sahara green
    ctx.beginPath();
    ctx.ellipse(1150, 400, 60, 120, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add Sahara Desert
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(1120, 350, 45, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Europe - more detailed
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(1080, 280, 35, 25, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Asia - large continent with varied terrain
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(1400, 320, 120, 80, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Add Himalayas (brown/white for mountains)
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.ellipse(1350, 340, 40, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Siberian forests
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.ellipse(1300, 250, 80, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // North America - varied terrain
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(400, 280, 90, 100, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Rocky Mountains
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.ellipse(350, 300, 20, 60, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // South America - Amazon and Andes
    ctx.fillStyle = '#059669'; // Amazon green
    ctx.beginPath();
    ctx.ellipse(600, 600, 50, 120, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // Andes Mountains
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.ellipse(580, 650, 15, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Australia
    ctx.fillStyle = '#d97706'; // Desert colors
    ctx.beginPath();
    ctx.ellipse(1650, 750, 60, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Green coastal areas
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(1680, 740, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antarctica
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(1024, 950, 200, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Greenland
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(700, 180, 35, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  private createEarthNormalMap(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base normal map (neutral blue for flat ocean)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add mountain ranges with white/light colors for height
    const mountains = [
      {x: 675, y: 160, w: 40, h: 15, color: '#ffffff'}, // Himalayas
      {x: 175, y: 150, w: 20, h: 60, color: '#e0e0ff'}, // Rockies
      {x: 290, y: 325, w: 15, h: 80, color: '#e0e0ff'}, // Andes
    ];

    mountains.forEach(mountain => {
      ctx.fillStyle = mountain.color;
      ctx.beginPath();
      ctx.ellipse(mountain.x, mountain.y, mountain.w, mountain.h, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  }

  private createSpecularMap(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Black base (no reflection on land)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White/gray for water (reflective)
    ctx.fillStyle = '#808080';
    
    // Ocean areas
    const oceans = [
      {x: 256, y: 256, w: 200, h: 150}, // Atlantic
      {x: 100, y: 200, w: 150, h: 200}, // Pacific
      {x: 750, y: 300, w: 120, h: 100}, // Indian Ocean
    ];

    oceans.forEach(ocean => {
      ctx.beginPath();
      ctx.ellipse(ocean.x, ocean.y, ocean.w, ocean.h, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  }

  private createClouds(): void {
    const geometry = new THREE.SphereGeometry(4.02, 128, 128); // Slightly larger than Earth (4.0 + 0.02)
    
    const cloudTexture = this.createRealisticCloudTexture();
    
    const material = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      alphaTest: 0.1
    });

    this.clouds = new THREE.Mesh(geometry, material);
    this.scene.add(this.clouds);
  }

  private createRealisticCloudTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Generate realistic cloud formations
    const cloudFormations = [
      // Tropical clouds around equator
      {x: 400, y: 450, size: 80, density: 0.9, type: 'tropical'},
      {x: 600, y: 470, size: 100, density: 0.8, type: 'tropical'},
      {x: 1200, y: 460, size: 120, density: 0.85, type: 'tropical'},
      {x: 1500, y: 440, size: 90, density: 0.8, type: 'tropical'},
      
      // Storm systems
      {x: 300, y: 300, size: 150, density: 0.95, type: 'storm'},
      {x: 800, y: 350, size: 130, density: 0.9, type: 'storm'},
      {x: 1400, y: 320, size: 140, density: 0.92, type: 'storm'},
      
      // Polar clouds
      {x: 1024, y: 150, size: 200, density: 0.7, type: 'polar'},
      {x: 1024, y: 850, size: 250, density: 0.75, type: 'polar'},
      
      // Scattered cumulus
      {x: 200, y: 200, size: 60, density: 0.6, type: 'cumulus'},
      {x: 500, y: 250, size: 70, density: 0.65, type: 'cumulus'},
      {x: 900, y: 230, size: 55, density: 0.6, type: 'cumulus'},
      {x: 1300, y: 280, size: 65, density: 0.62, type: 'cumulus'},
      {x: 1700, y: 240, size: 58, density: 0.6, type: 'cumulus'},
    ];

    cloudFormations.forEach(formation => {
      this.drawCloudFormation(ctx, formation);
    });

    // Add some wispy high altitude clouds
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const length = Math.random() * 100 + 50;
      const opacity = Math.random() * 0.3 + 0.1;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  private drawCloudFormation(ctx: CanvasRenderingContext2D, formation: any): void {
    const { x, y, size, density, type } = formation;
    
    let cloudCount, cloudSize, opacity;
    
    switch (type) {
      case 'tropical':
        cloudCount = 8;
        cloudSize = size / 4;
        opacity = density * 0.8;
        break;
      case 'storm':
        cloudCount = 12;
        cloudSize = size / 3;
        opacity = density * 0.9;
        break;
      case 'polar':
        cloudCount = 15;
        cloudSize = size / 5;
        opacity = density * 0.6;
        break;
      case 'cumulus':
      default:
        cloudCount = 5;
        cloudSize = size / 3;
        opacity = density * 0.7;
        break;
    }

    for (let i = 0; i < cloudCount; i++) {
      const offsetX = (Math.random() - 0.5) * size;
      const offsetY = (Math.random() - 0.5) * size * 0.5;
      const radius = cloudSize * (0.5 + Math.random() * 0.5);
      
      const gradient = ctx.createRadialGradient(
        x + offsetX, y + offsetY, 0,
        x + offsetX, y + offsetY, radius
      );
      
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.6, `rgba(255, 255, 255, ${opacity * 0.7})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private createAtmosphere(): void {
    const geometry = new THREE.SphereGeometry(4.6, 128, 128); // Earth radius (4.0) * 1.15
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.8 },
        p: { value: 3.0 },
        glowColor: { value: new THREE.Color(0x87ceeb) },
        viewVector: { value: this.camera.position },
        time: { value: 0.0 }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float time;
        varying float intensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          
          vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
          float fresnel = dot(normalize(viewVector), actual_normal);
          
          // Add atmospheric scattering effect
          intensity = pow(0.8 - fresnel, 2.0);
          intensity += sin(time * 2.0 + position.y * 3.0) * 0.1;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float time;
        varying float intensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Atmospheric color variation
          vec3 atmosColor = glowColor;
          
          // Add blue scattering at the edges
          float edge = pow(intensity, 1.5);
          atmosColor = mix(glowColor, vec3(0.5, 0.8, 1.0), edge);
          
          // Add some animated aurora-like effects at poles
          float polarEffect = abs(vPosition.y) > 0.8 ? 
            sin(time * 3.0 + vPosition.x * 10.0) * 0.3 : 0.0;
          atmosColor += vec3(0.0, polarEffect, polarEffect * 0.5);
          
          vec3 glow = atmosColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.9);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    this.atmosphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.atmosphere);
  }

  private createGalaxyBackground(): void {
    // Create a sphere that surrounds everything but is visible - galaxy background
    const galaxyGeometry = new THREE.SphereGeometry(150, 64, 64);
    
    // Create galaxy texture with nebulae and distant stars
    const galaxyTexture = this.createGalaxyTexture();
    
    const galaxyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        galaxyTexture: { value: galaxyTexture },
        time: { value: 0.0 },
        brightness: { value: 0.8 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D galaxyTexture;
        uniform float time;
        uniform float brightness;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Sample galaxy texture
          vec4 galaxyColor = texture2D(galaxyTexture, vUv);
          
          // Add slow movement to simulate galaxy rotation
          vec2 rotatedUv = vUv;
          float angle = time * 0.0005;
          rotatedUv -= 0.5;
          rotatedUv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * rotatedUv;
          rotatedUv += 0.5;
          
          vec4 rotatedGalaxy = texture2D(galaxyTexture, rotatedUv);
          
          // Blend original and rotated for depth effect
          vec4 finalColor = mix(galaxyColor, rotatedGalaxy, 0.3);
          
          // Enhance brightness and add subtle pulsing
          float pulse = 0.8 + 0.2 * sin(time * 0.3);
          finalColor.rgb *= brightness * pulse;
          
          // Ensure galaxy stays in background
          gl_FragColor = vec4(finalColor.rgb, finalColor.a * 0.7);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true
    });

    const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    // Position galaxy at origin, same as Earth
    galaxy.position.set(0, 0, 0);
    this.scene.add(galaxy);
    
    // Store reference for animation
    this.galaxy = galaxy;
  }

  private createGalaxyTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep space background - more visible with better contrast
    const spaceGradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1024);
    spaceGradient.addColorStop(0, '#1a1a3a'); // Lighter dark blue center
    spaceGradient.addColorStop(0.3, '#2a1b4e'); // Purple
    spaceGradient.addColorStop(0.6, '#2a3a6e'); // Blue
    spaceGradient.addColorStop(0.8, '#1a2a4a'); // Dark blue
    spaceGradient.addColorStop(1, '#0a0a1a'); // Dark edges
    ctx.fillStyle = spaceGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add prominent Milky Way-like galactic plane
    const milkyWayGradient = ctx.createLinearGradient(0, 300, 0, 724);
    milkyWayGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    milkyWayGradient.addColorStop(0.2, 'rgba(168, 85, 247, 0.4)');
    milkyWayGradient.addColorStop(0.4, 'rgba(217, 119, 6, 0.6)');
    milkyWayGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.5)');
    milkyWayGradient.addColorStop(0.8, 'rgba(168, 85, 247, 0.4)');
    milkyWayGradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
    ctx.fillStyle = milkyWayGradient;
    ctx.fillRect(0, 300, canvas.width, 424);

    // Add bright nebulae with higher opacity
    const nebulae = [
      { x: 300, y: 200, color: 'rgba(236, 72, 153, 0.4)', size: 150 },
      { x: 1200, y: 300, color: 'rgba(59, 130, 246, 0.35)', size: 200 },
      { x: 1600, y: 600, color: 'rgba(34, 197, 94, 0.3)', size: 180 },
      { x: 500, y: 700, color: 'rgba(251, 191, 36, 0.4)', size: 160 },
      { x: 1800, y: 150, color: 'rgba(147, 51, 234, 0.4)', size: 140 },
      { x: 100, y: 500, color: 'rgba(239, 68, 68, 0.3)', size: 120 },
      { x: 800, y: 800, color: 'rgba(99, 102, 241, 0.35)', size: 170 },
      { x: 1400, y: 800, color: 'rgba(245, 101, 101, 0.3)', size: 130 }
    ];

    nebulae.forEach(nebula => {
      const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.size);
      gradient.addColorStop(0, nebula.color);
      gradient.addColorStop(0.4, nebula.color.replace(/0\.\d+/, '0.15'));
      gradient.addColorStop(0.8, nebula.color.replace(/0\.\d+/, '0.05'));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add many more visible stars
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const brightness = Math.random();
      const size = Math.random() * 3 + 0.5;
      
      // Vary star colors with higher opacity
      let starColor;
      const colorRand = Math.random();
      if (colorRand < 0.5) {
        starColor = `rgba(255, 255, 255, ${brightness * 0.9})`; // Bright white stars
      } else if (colorRand < 0.7) {
        starColor = `rgba(255, 220, 180, ${brightness * 0.8})`; // Yellow stars
      } else if (colorRand < 0.85) {
        starColor = `rgba(180, 200, 255, ${brightness * 0.7})`; // Blue stars
      } else {
        starColor = `rgba(255, 180, 120, ${brightness * 0.6})`; // Red stars
      }
      
      ctx.fillStyle = starColor;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow to more stars
      if (brightness > 0.5) {
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        glowGradient.addColorStop(0, starColor.replace(/0\.\d+/, '0.4'));
        glowGradient.addColorStop(0.5, starColor.replace(/0\.\d+/, '0.2'));
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add more prominent star clusters
    for (let i = 0; i < 15; i++) {
      const clusterX = Math.random() * canvas.width;
      const clusterY = Math.random() * canvas.height;
      const clusterSize = Math.random() * 100 + 60;
      
      for (let j = 0; j < 30; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * clusterSize;
        const starX = clusterX + Math.cos(angle) * distance;
        const starY = clusterY + Math.sin(angle) * distance;
        
        if (starX >= 0 && starX < canvas.width && starY >= 0 && starY < canvas.height) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.4})`;
          ctx.beginPath();
          ctx.arc(starX, starY, Math.random() * 2 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Add some cosmic dust lanes
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = Math.random() * 200 + 100;
      const height = Math.random() * 20 + 5;
      
      ctx.fillStyle = 'rgba(50, 50, 100, 0.3)';
      ctx.fillRect(x, y, width, height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

 

  private addLighting(): void {
    // Ambient light (space is dark, very low ambient)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    this.scene.add(ambientLight);

    // Sun light (directional light)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 2, 5);
    sunLight.castShadow = false; // We'll handle shadows manually for performance
    this.scene.add(sunLight);

    // Add subtle rim lighting from the opposite side
    const rimLight = new THREE.DirectionalLight(0x4169e1, 0.3);
    rimLight.position.set(-5, -2, -5);
    this.scene.add(rimLight);

    // Add starlight (very subtle)
    const starLight = new THREE.AmbientLight(0x9bb5ff, 0.05);
    this.scene.add(starLight);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Rotate Earth (increased speed for more visible rotation)
    this.earth.rotation.y += 0.008; // Increased from 0.002 to 0.008

    // Rotate clouds slightly faster (wind effect)
    this.clouds.rotation.y += 0.010; // Increased from 0.004 to 0.010

    // Update atmospheric effects
    if (this.atmosphere.material instanceof THREE.ShaderMaterial) {
      this.atmosphere.material.uniforms['viewVector'].value = this.camera.position;
      this.atmosphere.material.uniforms['time'].value = time;
    }

    // Update galaxy background animation
    if (this.galaxy && this.galaxy.material instanceof THREE.ShaderMaterial) {
      this.galaxy.material.uniforms['time'].value = time;
    }

    // Add subtle camera movement for more dynamic view
    this.camera.position.x = Math.cos(time * 0.1) * 0.1;
    this.camera.position.y = Math.sin(time * 0.05) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private createHTMLStars(): void {
    // Create HTML/CSS stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    starsContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;

    // Create multiple layers of stars
    for (let layer = 0; layer < 3; layer++) {
      const starLayer = document.createElement('div');
      starLayer.className = `star-layer-${layer}`;
      
      // Create stars for this layer
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size and animation duration
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        star.style.cssText = `
          position: absolute;
          left: ${x}%;
          top: ${y}%;
          width: ${size}px;
          height: ${size}px;
          background: white;
          border-radius: 50%;
          animation: twinkle ${duration}s ease-in-out infinite ${delay}s alternate;
          opacity: ${0.3 + Math.random() * 0.7};
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        `;
        
        starLayer.appendChild(star);
      }
      
      starsContainer.appendChild(starLayer);
    }

    // Add shooting stars
    for (let i = 0; i < 3; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.className = 'shooting-star';
      
      const startX = Math.random() * 100;
      const startY = Math.random() * 50;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 10;
      
      shootingStar.style.cssText = `
        position: absolute;
        left: ${startX}%;
        top: ${startY}%;
        width: 2px;
        height: 2px;
        background: white;
        border-radius: 50%;
        animation: shooting ${duration}s linear infinite ${delay}s;
        opacity: 0;
        box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
      `;
      
      starsContainer.appendChild(shootingStar);
    }

    // Add the container to the canvas parent
    const canvasContainer = this.earthCanvas.nativeElement.parentElement;
    if (canvasContainer) {
      canvasContainer.style.position = 'relative';
      canvasContainer.appendChild(starsContainer);
    }

    // Add CSS animations
    this.addStarStyles();
  }

  private addStarStyles(): void {
    // Check if styles already exist
    if (document.getElementById('star-styles')) return;

    const style = document.createElement('style');
    style.id = 'star-styles';
    style.textContent = `
      @keyframes twinkle {
        0% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
        100% { opacity: 0.3; transform: scale(1); }
      }

      @keyframes shooting {
        0% {
          opacity: 0;
          transform: translateX(0) translateY(0);
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translateX(300px) translateY(150px);
        }
      }

      .shooting-star::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        height: 1px;
        background: linear-gradient(90deg, white, transparent);
        transform-origin: 0 50%;
      }
    `;
    
    document.head.appendChild(style);
  }


  onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = this.earthCanvas.nativeElement.clientWidth / this.earthCanvas.nativeElement.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        this.earthCanvas.nativeElement.clientWidth,
        this.earthCanvas.nativeElement.clientHeight
      );
    }
  }
}
