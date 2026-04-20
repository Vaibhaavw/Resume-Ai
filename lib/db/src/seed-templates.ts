import { db } from "./index";
import { templatesTable } from "./schema/templates";
import { sql } from "drizzle-orm";

const SECTORS = [
  { id: 'tech', label: 'Technology', colorScheme: 'blue' },
  { id: 'healthcare', label: 'Healthcare', colorScheme: 'emerald' },
  { id: 'finance', label: 'Finance', colorScheme: 'slate' },
  { id: 'marketing', label: 'Marketing', colorScheme: 'violet' },
  { id: 'education', label: 'Education', colorScheme: 'amber' },
  { id: 'legal', label: 'Legal', colorScheme: 'zinc' },
  { id: 'engineering', label: 'Engineering', colorScheme: 'cyan' },
  { id: 'sales', label: 'Sales', colorScheme: 'rose' },
];

const LAYOUTS = [
  { id: 'classic-v3', label: 'Classic Executive' },
  { id: 'minimal', label: 'Minimal Elite' },
  { id: 'minimal-v2', label: 'Minimal Signature' },
  { id: 'minimal-v3', label: 'Minimal Executive' },
  { id: 'creative', label: 'Creative Elite' },
  { id: 'dark', label: 'Elite Dark' },
  { id: 'academic-classic', label: 'Academic Classic' },
  { id: 'modern-sidebar', label: 'Modern Sidebar' },
  { id: 'tech-executive', label: 'Tech Executive' },
  { id: 'creative-visual', label: 'Creative Visual' },
  { id: 'double-column', label: 'Double Column' },
  { id: 'corporate-elite', label: 'Corporate Elite' },
  { id: 'clean-slate', label: 'Clean Slate' },
  { id: 'graphite-pro', label: 'Graphite Professional' },
  { id: 'indigo-signature', label: 'Indigo Signature' },
  { id: 'executive-cv', label: 'Executive CV' },
];

async function seedTemplates() {
  console.log("Clearing old templates...");
  // Need to handle foreign key constraints or just delete/insert?
  // Let's just insert missing ones by ID. Actually we can TRUNCATE or just delete them.
  try {
    await db.delete(templatesTable);
    console.log("Deleted old templates.");
  } catch (e) {
    console.error("Error deleting old templates. They might be referenced.", e);
    // If they are referenced, we shouldn't delete them. We can do an upsert or manually update them.
  }

  const templatesToInsert = [];
  let templateId = 1;

  for (let l = 0; l < LAYOUTS.length; l++) {
    for (let s = 0; s < SECTORS.length; s++) {
      const layout = LAYOUTS[l];
      const sector = SECTORS[s];
      
      // Explicit mapping for each layout to its unique preview asset
      let previewPath = '/previews/classic.png';
      if (layout.id === 'minimal') {
        previewPath = '/previews/minimal.png';
      } else if (layout.id === 'minimal-v2') {
        previewPath = '/previews/signature.png';
      } else if (layout.id === 'academic-classic') {
        previewPath = '/previews/academic.png';
      } else if (layout.id === 'modern-sidebar') {
        previewPath = '/previews/modern.png';
      } else if (layout.id === 'tech-executive') {
        previewPath = '/previews/tech_exec.png';
      } else if (layout.id === 'creative' || layout.id === 'creative-visual') {
        previewPath = '/previews/creative.png';
      } else if (layout.id === 'dark') {
        previewPath = '/previews/dark.png';
      } else if (layout.id === 'double-column') {
        previewPath = '/previews/double_column.png';
      } else if (layout.id === 'corporate-elite') {
        previewPath = '/previews/corporate.png';
      }

      templatesToInsert.push({
        id: templateId++,
        name: `${layout.label} - ${sector.label}`,
        description: `A ${layout.label.toLowerCase()} resume template optimized for the ${sector.label} sector.`,
        style: layout.id,
        tier: "free",
        previewUrl: previewPath,
        colorScheme: sector.colorScheme,
      });
    }
  }

  console.log(`Inserting ${templatesToInsert.length} templates into the database...`);
  
  for (const template of templatesToInsert) {
    await db.insert(templatesTable)
      .values(template)
      .onConflictDoUpdate({
        target: templatesTable.id,
        set: {
          name: template.name,
          description: template.description,
          style: template.style,
          colorScheme: template.colorScheme
        }
      });
  }

  console.log("Seeding complete!");
}

seedTemplates()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
