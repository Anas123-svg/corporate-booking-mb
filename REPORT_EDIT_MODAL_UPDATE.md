# Report Edit - Updated Features

## Key Changes Made

### 1. **Modal-Based Section Creation**
- Removed inline "Add New Section" input field
- Added a floating "Add New Section" button at the bottom of the sections list
- Clicking the button opens a modal dialog with fields for:
  - Section Title
  - Area (location/room name)
  - Comment Details
  - Image upload (with preview of uploaded images)
- Modal allows uploading multiple images before creating the section
- New sections are created with all provided details already filled in

### 2. **Unified Section UI**
- **Server-provided sections** and **newly added sections** now look identical
- Both types support the same features:
  - Image upload and removal
  - Comment management
  - Status selection (Red/Amber/Green)
  
### 3. **Image Management in All Sections**
- **Inspection Sections** (from server):
  - Changed from "Read-only" to fully editable
  - Can upload new images via drag-and-drop area
  - Can remove existing images (hover over image → click trash icon)

- **Custom Sections** (newly added):
  - Full image management with upload/remove capabilities
  - Images displayed with hover effects showing delete button

### 4. **Component Structure**

#### SectionManagement.tsx Updates:
- Removed inline add section form
- Replaced with modal dialog for creating new sections
- Modal includes:
  - Text inputs for title and area
  - Textarea for comment details
  - Image upload functionality
  - Image preview thumbnails with delete capability
- Sections rendered below modal button
- All sections styled identically with consistent layout

#### Main Edit Page Updates:
- Updated `handleAddSection` to accept: `(title, area, comment, images)`
- Added `handleSectionImageRemove` for deleting images
- Updated `renderInspectionSections` to support image management
- All state handlers integrated with new component props

## Visual Flow

### Adding a New Section:
1. User clicks "Add New Section" button (centered, below existing sections)
2. Modal appears with section form
3. User fills in:
   - Section Title (required)
   - Area (optional but recommended)
   - Comment Details (optional)
   - Images (upload multiple via drag-and-drop)
4. User clicks "Add Section" button
5. Modal closes, new section appears above "Add New Section" button

### Section Layout (All Types):
```
┌─ Section Title                      [Delete X]
├─ Status Dropdown
├─ Images Section
│  ├─ Upload Area (drag-drop)
│  └─ Image Thumbnails (with delete on hover)
└─ Comments Section
   ├─ Add Comment Area
   └─ Existing Comments with Delete
```

## Data Structure

### Additional Sections:
```typescript
additionalSections: {
  [sectionTitle]: {
    title: string;
    questions: string[];
    images: string[];        // Cloudinary URLs
    comments: string[];
    status: "Red" | "Amber" | "Green" | "";
  }
}
```

### Inspection Sections (Updated):
- Now supports image upload/removal
- Images are editable (previously read-only)
- Can upload to Cloudinary for new images

## File Changes

### Created/Modified:
1. **src/components/reports/SectionManagement.tsx** - Complete redesign with modal
2. **src/app/(admin)/(others-pages)/app-jobs/[id]/reports/edit/[reportId]/page.tsx** - Updated handlers and inspection sections image management

## Styling Features

- **Modal Dialog**: Centered overlay with sticky header/footer
- **Responsive Design**: Works on mobile and desktop
- **Dark Mode Support**: Full dark theme support
- **Image Hover Effects**: Delete button appears on hover with smooth transitions
- **Loading States**: Shows spinner during image uploads
- **Toast Notifications**: User feedback for all actions

## Behavior Details

### Modal Behavior:
- ESC key closes modal (click X button)
- Click outside modal doesn't close it (intentional)
- Section title is required to create section
- Images are optional but recommended
- Section already exists check prevents duplicates

### Image Management:
- Supports JPG, PNG, WebP, GIF formats
- Multiple files can be selected at once
- Images uploaded to Cloudinary automatically
- Hover on image thumbnail shows delete button
- Deleted images removed immediately from UI and saved on save

### No Visual Differences:
- All sections have identical styling
- Headers all use red color (same as inspection sections)
- All have delete button (X) in header
- All have same status selector
- All have same image upload area
- All have same comment management

## New User Flow

1. User edits report
2. Existing server sections displayed with image management
3. User can add new sections via "Add New Section" button
4. New sections appear below server sections, before "Add New Section" button
5. All sections can be edited/have images managed
6. Click Save to persist all changes

## Icons Used

- `Plus` - Add Section button
- `Upload` - Image upload area
- `Trash2` - Delete image button
- `X` - Close modal, delete section, delete comment
- `Loader2` - Loading spinner during uploads

All icons from lucide-react library.
