# Simplified Section Management Implementation

## Overview
The system now allows adding new inspection sections directly to the `inspectionSections` object **without changing the JSON structure from the server**. New sections are stored in the exact same format as existing inspection sections.

## How It Works

### Server Data Structure (Original)
```json
{
  "inspectionSections": {
    "01. Safe Access and Egress": ["Safe Access and Egress"],
    "02. Signing and out": ["Signing and out"],
    ...
    "34. Open Voids": ["Open Voids"],
    "sectionT": ["sectionT"]
  },
  "inspectionAnswers": {},
  "sectionImages": {},
  "sectionComments": {},
  "sectionStatus": {},
  "sectionVisibility": {}
}
```

### Adding a New Section
1. User clicks "Add New Section" button in the UI
2. A simple dialog asks for the section name (e.g., "Test")
3. The new section is added to `inspectionSections`:
   ```json
   {
     "inspectionSections": {
       ...existing sections...,
       "Test": ["Test"]  // Same structure as others
     }
   }
   ```

### Key Features
- **Same Structure**: New sections use the same format as server-provided sections
- **Same Rendering**: New sections render identically to existing sections
- **Full Functionality**: New sections support:
  - Questions with Yes/No/N/A answers
  - Image uploads (via Cloudinary)
  - Comments
  - Status selection (Red/Amber/Green)
  - Visibility toggle
- **Easy Deletion**: Only custom sections show a delete button
- **Clean Data**: Deleting a section cleans up all related data (images, comments, status, visibility)

## Implementation Details

### EditReport Page (page.tsx)
```typescript
// Track custom sections to show delete button only for them
const [customSections, setCustomSections] = useState<string[]>([]);

// Add a custom section
const handleAddCustomSection = (sectionName: string) => {
  setCustomSections((prev) => [...prev, sectionName]);
  setFormData((prev) => ({
    ...prev,
    inspectionSections: {
      ...(prev.inspectionSections || {}),
      [sectionName]: [sectionName],  // Structure: "Test": ["Test"]
    },
  }));
};

// Delete a custom section
const handleDeleteCustomSection = (sectionName: string) => {
  setCustomSections((prev) => prev.filter((s) => s !== sectionName));
  // Also removes related data (images, comments, status, visibility)
};
```

### SectionManagement Component
- Receives all `inspectionSections` (both original and custom)
- Receives list of `customSections` to identify which ones have delete button
- Handles all operations (images, comments, status, answers)
- Shows unified interface for all sections

## Example Usage

### Before (Original JSON)
```json
{
  "inspectionSections": {
    "34. Open Voids": ["Open Voids"],
    "35. Competency": ["Competency"]
  }
}
```

### After Adding "Test" Section
```json
{
  "inspectionSections": {
    "34. Open Voids": ["Open Voids"],
    "35. Competency": ["Competency"],
    "Test": ["Test"]  // New section added with same structure
  }
}
```

### When Saved
The entire `form_data` is sent to the server, including the new section in `inspectionSections`. When the report is loaded again, the "Test" section appears alongside all other inspection sections.

## Benefits
✅ No changes to server JSON structure
✅ New sections render identically to existing ones
✅ Full feature parity with inspection sections
✅ Clean data management
✅ Easy to identify and delete custom sections
✅ Backward compatible with existing code

## Files Modified
- `src/components/reports/SectionManagement.tsx` - Refactored to work with unified sections
- `src/app/(admin)/(others-pages)/app-jobs/[id]/reports/edit/[reportId]/page.tsx` - Added custom section tracking and handlers
