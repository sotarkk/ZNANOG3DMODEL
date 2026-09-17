import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { ModelData } from './atomisticGenerator';
import { AuthorBranding, DEFAULT_AUTHOR_BRANDING } from '../types';
import { generateCompleteSuiteHTML } from './completeSuiteHTMLGenerator';

export { generateCompleteSuiteHTML };

/**
 * Builds a Three.js 3D Group containing all atom spheres, bond cylinders,
 * and highlighted covalent bridges with exact presentation colors & PBR materials.
 */
export function buildThreeSceneFromModel(model: ModelData): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ZnO_GNP_Nanocomposite_Digital_Twin';

  // Sphere and cylinder geometries
  const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
  const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

  // Materials with exact presentation colors and physical PBR properties
  const carbonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00e676'), // Emerald Green
    roughness: 0.35,
    metalness: 0.05,
    name: 'Carbon_EmeraldGreen',
  });

  const zincMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#facc15'), // Golden Yellow
    roughness: 0.22,
    metalness: 0.55,
    name: 'Zinc_GoldenYellow',
  });

  const oxygenMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ef4444'), // Vivid Scarlet Red
    roughness: 0.35,
    metalness: 0.05,
    name: 'Oxygen_ScarletRed',
  });

  const defectMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#06b6d4'), // Glowing Cyan
    roughness: 0.2,
    metalness: 0.1,
    emissive: new THREE.Color('#06b6d4'),
    emissiveIntensity: 0.8,
    name: 'OxygenVacancy_ActiveDefect',
  });

  const hydrogenMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'), // Pure White
    roughness: 0.15,
    metalness: 0.02,
    name: 'Hydrogen_PureWhite',
  });

  const standardBondMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#64748b'), // Slate Grey
    roughness: 0.4,
    metalness: 0.2,
    name: 'Standard_Lattice_Bond',
  });

  const bridgeBondMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f43f5e'), // Highlight Rose/Red
    roughness: 0.25,
    metalness: 0.4,
    emissive: new THREE.Color('#f43f5e'),
    emissiveIntensity: 0.4,
    name: 'Covalent_ZnOC_Bridge_Bond',
  });

  const atomsGroup = new THREE.Group();
  atomsGroup.name = 'Atoms';

  // 1. Add Atoms
  model.atoms.forEach((atom) => {
    let mat = carbonMat;
    let radius = 0.46;

    if (atom.element === 'Zn') {
      mat = zincMat;
      radius = 0.60;
    } else if (atom.element === 'O') {
      mat = oxygenMat;
      radius = 0.44;
    } else if (atom.element === 'VO') {
      mat = defectMat;
      radius = 0.38;
    } else if (atom.element === 'H') {
      mat = hydrogenMat;
      radius = 0.24;
    }

    const sphereMesh = new THREE.Mesh(sphereGeo, mat);
    sphereMesh.position.set(atom.x, atom.y, atom.z);
    sphereMesh.scale.set(radius, radius, radius);
    sphereMesh.name = `${atom.element}_${atom.id}`;
    atomsGroup.add(sphereMesh);
  });

  group.add(atomsGroup);

  // 2. Add Bonds
  const bondsGroup = new THREE.Group();
  bondsGroup.name = 'Bonds';

  const upVec = new THREE.Vector3(0, 1, 0);

  model.bonds.forEach((bond) => {
    const a1 = bond.atom1;
    const a2 = bond.atom2;
    if (!a1 || !a2) return;

    const p1 = new THREE.Vector3(a1.x, a1.y, a1.z);
    const p2 = new THREE.Vector3(a2.x, a2.y, a2.z);
    const dist = p1.distanceTo(p2);
    if (dist < 0.001) return;

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();

    const isBridge = !!bond.isCovalentBridge || bond.type === 'zn-o-c_bridge';
    const bondRadius = isBridge ? 0.12 : 0.07;
    const mat = isBridge ? bridgeBondMat : standardBondMat;

    const cylinderMesh = new THREE.Mesh(cylinderGeo, mat);
    cylinderMesh.position.copy(mid);
    cylinderMesh.scale.set(bondRadius, dist, bondRadius);

    const quat = new THREE.Quaternion().setFromUnitVectors(upVec, dir);
    cylinderMesh.setRotationFromQuaternion(quat);
    cylinderMesh.name = isBridge ? `BridgeBond_${bond.id}` : `Bond_${bond.id}`;

    bondsGroup.add(cylinderMesh);
  });

  group.add(bondsGroup);

  return group;
}

/**
 * Generates Binary GLTF (.GLB) buffer for 100% accurate 3D rendering
 * across all 3D modeling websites (Sketchfab, Blender, Three.js Editor, 3D Builder, Windows 3D Viewer, etc.)
 */
export async function generateGLBFile(
  model: ModelData,
  branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING
): Promise<ArrayBuffer> {
  const group = buildThreeSceneFromModel(model);
  group.name = branding.projectTitle;
  group.userData = {
    title: branding.projectTitle,
    author: branding.leadAuthor,
    team: branding.teamMembers,
    institution: branding.institution,
    subtitle: branding.projectSubtitle,
    contact: branding.contactEmail,
  };
  const exporter = new GLTFExporter();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      group,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          const str = JSON.stringify(gltf);
          const encoder = new TextEncoder();
          resolve(encoder.encode(str).buffer);
        }
      },
      (error) => {
        reject(error);
      },
      { binary: true }
    );
  });
}

/**
 * Generates Stereolithography (.STL) binary or ASCII buffer
 * Universal format for 3D viewers (Windows 3D Viewer, 3D Builder, Mac Preview),
 * CAD software (Maya, 3ds Max, SolidWorks, MeshLab), and 3D printing slicers (Cura, Prusa, Bambu Studio).
 */
export function generateSTLFile(
  model: ModelData,
  branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING,
  binary = false
): ArrayBuffer | string {
  const group = buildThreeSceneFromModel(model);
  group.name = branding.projectTitle;
  const exporter = new STLExporter();
  const res = exporter.parse(group, { binary });
  if (res instanceof DataView) {
    return res.buffer;
  }
  return res;
}

/**
 * Generates Wavefront .OBJ full 3D mesh via Three.js OBJExporter
 * Exports all atoms (spheres) and bonds (cylinders) with exact geometry
 */
export function generateOBJMeshFile(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  const group = buildThreeSceneFromModel(model);
  const exporter = new OBJExporter();
  const rawObj = exporter.parse(group);
  const header = `# Wavefront OBJ - ${branding.projectTitle}\n# Author: ${branding.leadAuthor} | ${branding.institution}\n# ${branding.projectSubtitle}\n# Generated: ${new Date().toISOString()}\n\n`;
  return header + rawObj;
}

/**
 * Generates Wavefront .OBJ 3D Model format with standalone MTL file
 */
export function generateOBJFile(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): { obj: string; mtl: string } {
  let mtl = `# Material definitions for ${branding.projectTitle}
# Author: ${branding.leadAuthor} | ${branding.institution}
newmtl Carbon_EmeraldGreen
Kd 0.000 0.902 0.463
Ka 0.000 0.100 0.050
Ks 0.200 0.200 0.200
Ns 50.0
d 1.0

newmtl Zinc_GoldenYellow
Kd 0.980 0.800 0.082
Ka 0.150 0.120 0.010
Ks 0.600 0.500 0.100
Ns 80.0
d 1.0

newmtl Oxygen_ScarletRed
Kd 0.937 0.267 0.267
Ka 0.100 0.020 0.020
Ks 0.200 0.200 0.200
Ns 50.0
d 1.0

newmtl Defect_GlowingCyan
Kd 0.024 0.714 0.831
Ka 0.024 0.714 0.831
Ke 0.024 0.714 0.831
Ks 0.300 0.300 0.300
Ns 60.0
d 1.0

newmtl Hydrogen_PureWhite
Kd 1.000 1.000 1.000
Ka 0.200 0.200 0.200
Ks 0.300 0.300 0.300
Ns 40.0
d 1.0

newmtl Lattice_Bond
Kd 0.392 0.455 0.545
Ka 0.050 0.050 0.050
Ks 0.100 0.100 0.100
Ns 30.0
d 1.0

newmtl Bridge_ZnOC_Bond
Kd 0.957 0.247 0.369
Ka 0.200 0.050 0.080
Ke 0.300 0.080 0.100
Ks 0.400 0.200 0.200
Ns 60.0
d 1.0
`;

  let obj = `# Wavefront OBJ - ${branding.projectTitle}
# Author: ${branding.leadAuthor} (${branding.teamMembers}) | ${branding.institution}
# ${branding.projectSubtitle}
mtllib zno_graphene_nanocomposite.mtl
o ZnO_GNP_Nanocomposite

`;

  let vIdx = 1;

  // Function to create a small octahedron approximation for each atom center to keep OBJ size crisp
  model.atoms.forEach((atom) => {
    let mtlName = 'Carbon_EmeraldGreen';
    let r = 0.46;
    if (atom.element === 'Zn') {
      mtlName = 'Zinc_GoldenYellow';
      r = 0.60;
    } else if (atom.element === 'O') {
      mtlName = 'Oxygen_ScarletRed';
      r = 0.44;
    } else if (atom.element === 'VO') {
      mtlName = 'Defect_GlowingCyan';
      r = 0.38;
    } else if (atom.element === 'H') {
      mtlName = 'Hydrogen_PureWhite';
      r = 0.24;
    }

    obj += `g Atom_${atom.element}_${atom.id}\n`;
    obj += `usemtl ${mtlName}\n`;

    const { x, y, z } = atom;
    // 6 vertices of an octahedron
    obj += `v ${(x + r).toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}\n`;
    obj += `v ${(x - r).toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}\n`;
    obj += `v ${x.toFixed(4)} ${(y + r).toFixed(4)} ${z.toFixed(4)}\n`;
    obj += `v ${x.toFixed(4)} ${(y - r).toFixed(4)} ${z.toFixed(4)}\n`;
    obj += `v ${x.toFixed(4)} ${y.toFixed(4)} ${(z + r).toFixed(4)}\n`;
    obj += `v ${x.toFixed(4)} ${y.toFixed(4)} ${(z - r).toFixed(4)}\n`;

    const base = vIdx;
    vIdx += 6;

    // 8 triangular faces
    obj += `f ${base + 4} ${base + 0} ${base + 2}\n`;
    obj += `f ${base + 4} ${base + 2} ${base + 1}\n`;
    obj += `f ${base + 4} ${base + 1} ${base + 3}\n`;
    obj += `f ${base + 4} ${base + 3} ${base + 0}\n`;
    obj += `f ${base + 5} ${base + 2} ${base + 0}\n`;
    obj += `f ${base + 5} ${base + 1} ${base + 2}\n`;
    obj += `f ${base + 5} ${base + 3} ${base + 1}\n`;
    obj += `f ${base + 5} ${base + 0} ${base + 3}\n`;
  });

  return { obj, mtl };
}

/**
 * Generates an all-in-one Standalone 3D Interactive HTML file
 * User can double-click to open in ANY browser offline with 100% identical look!
 */
export function generateInteractiveHTML(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  return generateCompleteSuiteHTML(model, branding);
}

/**
 * Generates Blender 4.x/3.x Python Script (.PY)
 * Creates 100% photorealistic procedural materials in Blender with Cycles / EEVEE.
 */
export function generateBlenderScript(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  const atomsJson = JSON.stringify(
    model.atoms.map((a) => ({ elem: a.element, x: a.x, y: a.y, z: a.z, isBridge: a.isBridgeBonded, isDefect: a.isSurfaceDefect }))
  );
  const bondsJson = JSON.stringify(
    model.bonds.map((b) => ({
      x1: b.atom1.x,
      y1: b.atom1.y,
      z1: b.atom1.z,
      x2: b.atom2.x,
      y2: b.atom2.y,
      z2: b.atom2.z,
      isBridge: !!b.isCovalentBridge || b.type === 'zn-o-c_bridge',
    }))
  );

  return `# ==============================================================================
# Blender 4.x / 3.x Exact Replication Script - ${branding.projectTitle}
# Author: ${branding.leadAuthor} (${branding.teamMembers}) | ${branding.institution}
# ${branding.projectSubtitle}
# ==============================================================================
import bpy
import bmesh
import json
import math

# 1. Clean existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 2. Setup World Background
world = bpy.context.scene.world
world.use_nodes = True
bg_node = world.node_tree.nodes.get('Background')
if bg_node:
    bg_node.inputs[0].default_value = (0.024, 0.035, 0.075, 1.0) # Dark Obsidian

# 3. Create Custom Materials
def create_mat(name, color, metallic=0.0, roughness=0.3, emission=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness
        if emission:
            if 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emission
                bsdf.inputs['Emission Strength'].default_value = 2.0
            elif 'Emission' in bsdf.inputs:
                bsdf.inputs['Emission'].default_value = emission
    return mat

mat_carbon = create_mat('Mat_Carbon_Green', (0.0, 0.902, 0.463, 1.0), metallic=0.05, roughness=0.35)
mat_zinc = create_mat('Mat_Zinc_Yellow', (0.980, 0.800, 0.082, 1.0), metallic=0.60, roughness=0.20)
mat_oxygen = create_mat('Mat_Oxygen_Red', (0.937, 0.267, 0.267, 1.0), metallic=0.05, roughness=0.35)
mat_defect = create_mat('Mat_Oxygen_Vacancy', (0.024, 0.714, 0.831, 1.0), metallic=0.1, emission=(0.024, 0.714, 0.831, 1.0))
mat_hydrogen = create_mat('Mat_Hydrogen_White', (1.0, 1.0, 1.0, 1.0), metallic=0.02, roughness=0.15)
mat_bond = create_mat('Mat_Lattice_Bond', (0.392, 0.455, 0.545, 1.0), roughness=0.4)
mat_bridge = create_mat('Mat_Bridge_Bond', (0.957, 0.247, 0.369, 1.0), roughness=0.2, emission=(0.957, 0.247, 0.369, 1.0))

atoms_data = json.loads('${atomsJson}')
bonds_data = json.loads('${bondsJson}')

# 4. Generate Atoms
for a in atoms_data:
    elem = a['elem']
    r = 0.46
    mat = mat_carbon
    if elem == 'Zn':
        r = 0.60
        mat = mat_zinc
    elif elem == 'O':
        r = 0.44
        mat = mat_oxygen
    elif elem == 'VO':
        r = 0.38
        mat = mat_defect
    elif elem == 'H':
        r = 0.24
        mat = mat_hydrogen

    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(a['x'], a['y'], a['z']), segments=24, ring_count=24)
    sphere = bpy.context.active_object
    sphere.name = f"Atom_{elem}"
    sphere.data.materials.append(mat)
    bpy.ops.object.shade_smooth()

# 5. Generate Bonds
for b in bonds_data:
    p1 = (b['x1'], b['y1'], b['z1'])
    p2 = (b['x2'], b['y2'], b['z2'])
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    dz = p2[2] - p1[2]
    dist = math.sqrt(dx*dx + dy*dy + dz*dz)
    if dist < 0.001:
        continue

    mid = ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2, (p1[2]+p2[2])/2)
    radius = 0.12 if b['isBridge'] else 0.07
    mat = mat_bridge if b['isBridge'] else mat_bond

    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=dist, location=mid, vertices=16)
    cyl = bpy.context.active_object
    cyl.name = "BridgeBond" if b['isBridge'] else "Bond"
    cyl.data.materials.append(mat)
    bpy.ops.object.shade_smooth()

    # Align cylinder along bond vector
    phi = math.atan2(dy, dx)
    theta = math.acos(dz / dist)
    cyl.rotation_euler = (0, theta, phi + math.pi/2)

# 6. Add 3-Point Studio Lights
bpy.ops.object.light_add(type='SUN', location=(15, 20, 30))
sun = bpy.context.active_object
sun.data.energy = 3.5

bpy.ops.object.light_add(type='POINT', location=(-20, -25, 15))
rim = bpy.context.active_object
rim.data.energy = 500
rim.data.color = (0.576, 0.773, 0.992) # Soft blue

print("Successfully generated exact ZnO-GNP 3D Model in Blender with materials & lighting!")
`;
}

/**
 * Standard Protein Data Bank (.PDB) generator
 * Compliant with PDB Format v3.30 specification.
 */
export function generatePDBFile(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  let pdb = '';
  pdb += `HEADER    NANOCOMPOSITE DIGITAL TWIN (NANAURACLE)  31-AUG-26   V8\n`;
  pdb += `TITLE     ${branding.projectTitle.toUpperCase()}\n`;
  pdb += `COMPND    MOL_ID: 1; MOLECULE: ZnO-GNP HETEROSTRUCTURE;\n`;
  pdb += `COMPND   2 TURBOSTRATIC GRAPHENE (4-LAYER GNP) + WURTZITE ZnO NANOCRYSTAL;\n`;
  pdb += `AUTHOR    ${branding.leadAuthor.toUpperCase()} (${branding.teamMembers.toUpperCase()}) - ${branding.institution.toUpperCase()}\n`;
  pdb += `REMARK   1 RESEARCH SUITE: ${branding.projectSubtitle}\n`;
  pdb += `REMARK   1.1 CORRESPONDENCE: ${branding.contactEmail}\n`;
  pdb += `REMARK   2 ATOMIC STOICHIOMETRY: C=${model.stats.carbonAtPct}%, Zn=${model.stats.zincAtPct}%, O=${model.stats.oxygenAtPct}%, H=${model.stats.hydrogenAtPct}%\n`;
  if (model.stats.customEDX) {
    pdb += `REMARK   2.1 SAMPLE: ${model.stats.customEDX.sampleName}\n`;
    pdb += `REMARK   2.2 EDX SOURCE: ${model.stats.customEDX.sourceDescription}\n`;
    pdb += `REMARK   2.3 ACCELERATING VOLTAGE: ${model.stats.customEDX.acceleratingVoltageKv} kV, WD: ${model.stats.customEDX.workingDistanceMm} mm\n`;
  }
  pdb += `REMARK   3 INTERFACIAL PINNING: 16 COVALENT Zn-O-C BRIDGES (1.430 ANGSTROMS)\n`;
  pdb += `REMARK   4 SURFACE DEFECT STATES: 14 OXYGEN VACANCIES (V_O) ACTIVE CATALYTIC SITES\n`;
  pdb += `REMARK   5 CARRIER LIFETIME: 7.9 NS (SUPPRESSED EXCITON RECOMBINATION)\n`;
  pdb += `REMARK   6 PRESENTATION COLOR MAP: C=GREEN (#00e676), Zn=YELLOW (#facc15), O=RED (#ef4444), H=WHITE (#ffffff)\n`;

  // Write HETATM records
  model.atoms.forEach((atom, idx) => {
    const serial = (idx + 1).toString().padStart(5, ' ');
    
    // Atom name formatted per PDB standard
    let atomName = ' C  ';
    if (atom.element === 'Zn') atomName = 'ZN  ';
    else if (atom.element === 'O' || atom.element === 'VO') atomName = ' O  ';
    else if (atom.element === 'H') atomName = ' H  ';

    // Residue name
    const resName =
      atom.element === 'C' || atom.element === 'H'
        ? 'GNP '
        : atom.isBridgeBonded
        ? 'BRG '
        : 'ZNO ';

    // Chain ID: A for Graphene Substrate, B for ZnO Cluster
    const chainID = atom.element === 'C' || atom.element === 'H' ? 'A' : 'B';
    const resSeq = (atom.layer || (atom.element === 'C' ? 1 : 2)).toString().padStart(4, ' ');
    
    // Coordinates (8.3f)
    const x = atom.x.toFixed(3).padStart(8, ' ');
    const y = atom.y.toFixed(3).padStart(8, ' ');
    const z = atom.z.toFixed(3).padStart(8, ' ');
    const occ = (1.00).toFixed(2).padStart(6, ' ');
    const tempFactor = (0.00).toFixed(2).padStart(6, ' ');
    
    // Element symbol right-justified in cols 77-78
    const element = atom.element === 'Zn' ? 'ZN' : atom.element === 'VO' ? ' O' : atom.element.padStart(2, ' ');
    const charge = atom.element === 'Zn' ? '2+' : atom.element === 'O' ? '2-' : '  ';

    pdb += `HETATM${serial} ${atomName}${resName} ${chainID}${resSeq}    ${x}${y}${z}${occ}${tempFactor}          ${element}${charge}\n`;
  });

  // Write CONECT records
  const conectMap: { [key: number]: number[] } = {};
  model.bonds.forEach((b) => {
    if (!conectMap[b.atom1.id]) conectMap[b.atom1.id] = [];
    if (!conectMap[b.atom2.id]) conectMap[b.atom2.id] = [];
    if (!conectMap[b.atom1.id].includes(b.atom2.id)) conectMap[b.atom1.id].push(b.atom2.id);
    if (!conectMap[b.atom2.id].includes(b.atom1.id)) conectMap[b.atom2.id].push(b.atom1.id);
  });

  Object.keys(conectMap).forEach((atomIdStr) => {
    const atomId = parseInt(atomIdStr, 10);
    const bonded = conectMap[atomId];
    for (let i = 0; i < bonded.length; i += 4) {
      const slice = bonded.slice(i, i + 4);
      pdb += `CONECT${atomId.toString().padStart(5, ' ')}${slice
        .map((id) => id.toString().padStart(5, ' '))
        .join('')}\n`;
    }
  });

  pdb += `MASTER        0    0    0    0    0    0    0    0 ${model.atoms.length.toString().padStart(5, ' ')}    0 ${Object.keys(conectMap).length.toString().padStart(5, ' ')}    0\n`;
  pdb += `END\n`;
  return pdb;
}

/**
 * Crystallographic Information Framework (.CIF / mmCIF) generator
 */
export function generateCIFFile(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  let cif = '';
  cif += `data_ZNO_GNP_NANOCOMPOSITE\n`;
  cif += `# =========================================================================\n`;
  cif += `# ${branding.projectTitle}\n`;
  cif += `# Author: ${branding.leadAuthor} (${branding.teamMembers}) | ${branding.institution}\n`;
  cif += `# ${branding.projectSubtitle}\n`;
  cif += `# 16 Covalent Zn-O-C Bridges (1.430 A) | 14 Surface Oxygen Vacancies (V_O)\n`;
  cif += `# Colors: Carbon=Green (#00e676), Zinc=Yellow (#facc15), Oxygen=Red (#ef4444), Hydrogen=White (#ffffff)\n`;
  cif += `# =========================================================================\n\n`;

  cif += `_entry.id   ZNO_GNP_RESEARCH\n`;
  cif += `_struct.title '${branding.projectTitle}'\n`;
  cif += `_audit.author_name '${branding.leadAuthor}'\n`;
  cif += `_audit.creation_date ${new Date().toISOString().split('T')[0]}\n\n`;

  cif += `loop_\n`;
  cif += `_atom_site.group_PDB\n`;
  cif += `_atom_site.id\n`;
  cif += `_atom_site.type_symbol\n`;
  cif += `_atom_site.label_atom_id\n`;
  cif += `_atom_site.label_comp_id\n`;
  cif += `_atom_site.label_asym_id\n`;
  cif += `_atom_site.label_seq_id\n`;
  cif += `_atom_site.Cartn_x\n`;
  cif += `_atom_site.Cartn_y\n`;
  cif += `_atom_site.Cartn_z\n`;
  cif += `_atom_site.occupancy\n`;
  cif += `_atom_site.B_iso_or_equiv\n`;

  model.atoms.forEach((atom, idx) => {
    const group = 'HETATM';
    const id = idx + 1;
    const type = atom.element === 'VO' ? 'O' : atom.element;
    const atomLabel = `${type}${id}`;
    const compId = atom.element === 'C' || atom.element === 'H' ? 'GNP' : 'ZNO';
    const asymId = atom.element === 'C' || atom.element === 'H' ? 'A' : 'B';
    const seqId = atom.layer || 1;
    const x = atom.x.toFixed(3);
    const y = atom.y.toFixed(3);
    const z = atom.z.toFixed(3);
    const occ = '1.00';
    const bIso = '0.00';

    cif += `${group} ${id} ${type} ${atomLabel} ${compId} ${asymId} ${seqId} ${x} ${y} ${z} ${occ} ${bIso}\n`;
  });

  cif += `\n# --- Structural Interfacial Covalent Bridges (16 Zn-O-C Pinning Bonds) ---\n`;
  cif += `loop_\n`;
  cif += `_struct_conn.id\n`;
  cif += `_struct_conn.conn_type_id\n`;
  cif += `_struct_conn.ptnr1_label_atom_id\n`;
  cif += `_struct_conn.ptnr1_label_asym_id\n`;
  cif += `_struct_conn.ptnr2_label_atom_id\n`;
  cif += `_struct_conn.ptnr2_label_asym_id\n`;
  cif += `_struct_conn.dist_val\n`;

  model.bridges.forEach((br, bIdx) => {
    cif += `covale_${bIdx + 1} covale ${br.atom1.element}${br.atom1.id} B ${br.atom2.element}${br.atom2.id} A 1.430\n`;
  });

  return cif;
}

/**
 * Standard Cartesian Coordinate (.XYZ) generator
 */
export function generateXYZFile(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  let xyz = '';
  xyz += `${model.atoms.length}\n`;
  xyz += `${branding.projectTitle} | Author: ${branding.leadAuthor} (${branding.institution}) | C: Green (#00e676), Zn: Yellow (#facc15), O: Red (#ef4444), H: White (#ffffff) | 16 Zn-O-C Bridges (1.430 A) | 14 VO Defect Sites\n`;

  model.atoms.forEach((atom) => {
    const elem = atom.element === 'VO' ? 'O' : atom.element;
    xyz += `${elem.padEnd(3, ' ')} ${atom.x.toFixed(5).padStart(12, ' ')} ${atom.y.toFixed(5).padStart(12, ' ')} ${atom.z.toFixed(5).padStart(12, ' ')}\n`;
  });

  return xyz;
}

/**
 * PyMOL Reproduction Script (.PML)
 */
export function generatePyMOLScript(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  return `# ==============================================================================
# PyMOL Exact Replication Script - ${branding.projectTitle}
# Author: ${branding.leadAuthor} (${branding.teamMembers}) | ${branding.institution}
# ${branding.projectSubtitle}
# ==============================================================================

# 1. Initialize Viewport & Obsidian Background
reinitialize
set antialias, 2
set depth_cue, 1
set ray_trace_fog, 0
bg_color [0.024, 0.035, 0.075]

# 2. Load the PDB Coordinate File
load zno_graphene_nanocomposite.pdb, zno_gnp
hide everything, zno_gnp
show spheres, zno_gnp

# 3. Define Exact Presentation Colors matching ISEF Research Graphic
# Carbon = Emerald Green (#00e676)
set_color carbon_green, [0.000, 0.902, 0.463]
# Zinc = Golden Yellow (#facc15)
set_color zinc_yellow,   [0.980, 0.800, 0.082]
# Oxygen = Scarlet Red (#ef4444)
set_color oxygen_red,   [0.937, 0.267, 0.267]
# Hydrogen = Pure White (#ffffff)
set_color hydrogen_white,[1.000, 1.000, 1.000]

# 4. Color Assignment
color carbon_green, elem C
color zinc_yellow, elem Zn
color oxygen_red, elem O
color hydrogen_white, elem H

# 5. Atomic Radii & Space-filling Proportions
alter elem C, vdw=0.46
alter elem Zn, vdw=0.60
alter elem O, vdw=0.44
alter elem H, vdw=0.24
rebuild

# 6. Show Interfacial Covalent Zn-O-C Bonds
select gnp_substrate, chain A
select zno_nanocrystal, chain B
show sticks, zno_gnp
set stick_radius, 0.12
set stick_color, oxygen_red

# 7. Lighting, Specular Highlights & Raytracing Parameters
set specular, 0.55
set roughness, 0.25
set ambient, 0.35
set direct, 0.70
set light_count, 4
set ray_shadows, 1
set ray_trace_mode, 1

# 8. Set Camera Matrix to Angle 1: Side-Profile Interfacial View
set_view (\\
     0.925, -0.210,  0.318, \\
     0.365,  0.752, -0.548, \\
    -0.124,  0.624,  0.771, \\
     0.000,  0.000, -56.00, \\
    -0.600,  0.400,  4.500, \\
    40.000, 72.000, -20.000 )

# 9. Output ready
zoom zno_gnp, 1.8
print("NanAuracle ZnO-GNP 3D Model loaded successfully with exact ISEF presentation parameters!")
`;
}

/**
 * UCSF ChimeraX Script (.CXC)
 */
export function generateChimeraXScript(model: ModelData, branding: AuthorBranding = DEFAULT_AUTHOR_BRANDING): string {
  return `# ==============================================================================
# UCSF ChimeraX Command Script - ${branding.projectTitle}
# Author: ${branding.leadAuthor} (${branding.teamMembers}) | ${branding.institution}
# ${branding.projectSubtitle}
# ==============================================================================

# 1. Open the coordinate model
open zno_graphene_nanocomposite.pdb

# 2. Viewport styling & Obsidian Background
set bgColor #060913
graphics silhouettes true color black width 1.2
lighting soft depthCue true

# 3. Space-filling Sphere representation
style sphere

# 4. Exact Presentation Colors
color /A:C #00e676
color /B:ZN #facc15
color /B:O #ef4444
color /A:H #ffffff

# 5. Precise atomic radii
size atom /A:C 0.46
size atom /B:ZN 0.60
size atom /B:O 0.44
size atom /A:H 0.24

# 6. Material properties
material /B:ZN metalness 0.55 roughness 0.22
material /A:C roughness 0.35
material /B:O roughness 0.35

# 7. Orientation & Camera Framing (Angle 1 Side-Profile)
view matrix models 1,0.925,-0.210,0.318,-0.60,0.365,0.752,-0.548,0.40,-0.124,0.624,0.771,4.50
view
`;
}

/**
 * Mol* (RCSB PDB 3D Viewer) Configuration Guide and Quick Setup
 */
export function generateMolStarGuide(model: ModelData): string {
  return `# Mol* 3D Viewer (RCSB PDB / molstar.org) Exact Replication Guide
======================================================================
Follow these simple steps to view this exact 3D model on any Mol* / RCSB PDB web viewer:

1. GO TO THE MOL* WEB VIEWER:
   Navigate to: https://molstar.org/viewer/ or https://www.rcsb.org/3d-view

2. OPEN YOUR DOWNLOADED FILE:
   - Click "Open Files" in the top right menu
   - Select "zno_graphene_nanocomposite.pdb" or "zno_graphene_nanocomposite.cif"

3. SET REPRESENTATION STYLE:
   - Under Components -> "All", click "Add Representation"
   - Select "Ball and Stick" or "Spacefill" (Spheres)
   - Size: set Bond Size to 0.12, Atom Radius to 0.45

4. APPLY EXACT PRESENTATION COLOR PALETTE:
   - Color Theme: Select "Element Symbol" -> Custom Colors:
     - Carbon (C):    #00e676 (Bright Emerald Green)
     - Zinc (Zn):     #facc15 (Golden Yellow)
     - Oxygen (O):    #ef4444 (Vivid Scarlet Red)
     - Hydrogen (H):  #ffffff (Pure White)

5. SET BACKGROUND:
   - In Settings -> Canvas, set Background Color to #060913 (Dark Obsidian)

6. FOR GLB / 3D MODELING WEBSITES (Sketchfab, Three.js, Blender):
   - Use the .GLB download directly! It includes all pre-baked 3D spheres, cylinders,
     exact materials, and RGB colors with 100% zero-configuration required.
`;
}
