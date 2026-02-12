# Report Edit - New Features Documentation

## Overview
This document describes the new features added to the report editing functionality, including the ability to add custom sections with image uploads and manage comments with images.

## Features Added

### 1. **Dynamic Section Management**
Allow users to add, edit, and manage custom inspection sections within reports.

**Features:**
- ✅ Add new sections with custom titles
- ✅ Upload multiple images per section to Cloudinary
- ✅ Add comments to sections
- ✅ Set section status (Red/Amber/Green)
- ✅ Delete sections
- ✅ Edit section details

**Component Location:** `src/components/reports/SectionManagement.tsx`

### 2. **Advanced Comments Management**
Add detailed comments with images and area information.

**Features:**
- ✅ Add new comments with:
  - Area (location/room name)
  - Comment details/text
  - Optional image upload
- ✅ Edit existing comments
- ✅ Delete comments
- ✅ Update comment images via Cloudinary

**Component Location:** `src/components/reports/CommentsManagement.tsx`

### 3. **Cloudinary Image Upload**
Seamless image upload integration with Cloudinary.

**Features:**
- ✅ Upload images directly from the browser to Cloudinary
- ✅ Support for multiple image uploads
- ✅ Uses environment variables:
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- ✅ Error handling and user feedback via toast notifications

**Utility Location:** `src/utils/cloudinaryUpload.ts`

## Environment Variables Required

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

To get these values:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Find your Cloud Name in the account dashboard
3. Create an unsigned upload preset in Settings → Upload

## Data Structure

### Additional Sections (stored in formData)
```typescript
additionalSections: {
  [sectionTitle]: {
    title: string;
    questions: string[];
    images: string[]; // Cloudinary URLs
    comments: string[];
    status: "Red" | "Amber" | "Green" | "";
  }
}
```

### Additional Comments (stored in formData)
```typescript
additionalComments: [
  {
    area: string;
    text: string;
    imagePath?: string; // Cloudinary URL (optional)
  }
]
```

## Usage in the Report Edit Page

The new components are integrated into the main edit report page at:
`src/app/(admin)/(others-pages)/app-jobs/[id]/reports/edit/[reportId]/page.tsx`

### Section Management Component Usage:
```tsx
<SectionManagement
  sections={formData.additionalSections || {}}
  onSectionAdd={handleAddSection}
  onSectionDelete={handleDeleteSection}
  onImageUpload={handleSectionImageUpload}
  onCommentAdd={handleSectionCommentAdd}
  onCommentDelete={handleSectionCommentDelete}
  onCommentUpdate={handleSectionCommentUpdate}
  onStatusChange={handleSectionStatusChange}
/>
```

### Comments Management Component Usage:
```tsx
<CommentsManagement
  comments={formData.additionalComments || []}
  onCommentAdd={handleAddComment}
  onCommentUpdate={handleUpdateComment}
  onCommentDelete={handleDeleteComment}
/>
```

## Handlers Implemented

### Section Management Handlers:
- `handleAddSection(sectionTitle)` - Add new section
- `handleDeleteSection(sectionTitle)` - Delete section
- `handleSectionImageUpload(sectionTitle, imageUrls)` - Upload images
- `handleSectionCommentAdd(sectionTitle, comment)` - Add comment to section
- `handleSectionCommentDelete(sectionTitle, index)` - Delete section comment
- `handleSectionCommentUpdate(sectionTitle, index, comment)` - Update section comment
- `handleSectionStatusChange(sectionTitle, status)` - Update section status

### Comments Management Handlers:
- `handleAddComment(comment)` - Add new comment
- `handleUpdateComment(index, comment)` - Update comment
- `handleDeleteComment(index)` - Delete comment

## Image Upload Flow

1. User selects image(s) from their device
2. `uploadToCloudinary()` utility function handles upload
3. Images are uploaded to Cloudinary using the configured preset
4. Secure URLs are returned and stored in the form data
5. Images are displayed as thumbnails in the UI
6. All changes are saved to the server when user clicks "Save Changes"

## Validation & Error Handling

- **Section title validation**: Prevents empty titles and duplicates
- **Comment validation**: Requires both area and text fields
- **Image upload**: Shows loading states and error messages
- **Toast notifications**: Provides user feedback for all actions

## Styling

- Uses Tailwind CSS classes
- Supports dark mode (dark: prefix)
- Responsive design for mobile and desktop
- Consistent with existing report design

## Future Enhancements

- Drag and drop image upload
- Image cropping/editing before upload
- Section templates
- Auto-save functionality
- Comment threading/replies
- Section duplication
- Bulk operations

## Troubleshooting

### Images not uploading?
- Check Cloudinary credentials in `.env.local`
- Verify upload preset is configured as "unsigned"
- Check browser console for specific error messages

### Components not rendering?
- Ensure components are properly imported
- Verify environment variables are set
- Check that `formData` state is initialized

## File Locations
- **Main Page:** `src/app/(admin)/(others-pages)/app-jobs/[id]/reports/edit/[reportId]/page.tsx`
- **Section Component:** `src/components/reports/SectionManagement.tsx`
- **Comments Component:** `src/components/reports/CommentsManagement.tsx`
- **Cloudinary Utility:** `src/utils/cloudinaryUpload.ts`
