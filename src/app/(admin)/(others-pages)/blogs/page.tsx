"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import { useState } from "react";
import { Clock, Edit, Trash2, Plus, ChevronRight, ChevronLeft } from "lucide-react";

interface Blog {
  id: number;
  author: string;
  authorImage: string;
  title: string;
  titleImage: string;
  description: string;
  category: string;
  content: string;
  timeToRead: string;
}

const blogsData: Blog[] = [
  {
    id: 1,
    author: "Jane Cooper",
    authorImage: "/images/user/user-17.jpg",
    title: "10 Tips for Mastering Digital Marketing",
    titleImage: "https://placehold.jp/1280x720.png",
    description: "Learn the essential strategies that will take your digital marketing to the next level.",
    category: "Marketing",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor nisl nisi euismod nisi.",
    timeToRead: "5 min"
  },
  {
    id: 2,
    author: "Robert Fox",
    authorImage: "/images/user/user-18.jpg",
    title: "The Future of AI in Business Applications",
    titleImage: "https://placehold.jp/1280x720.png",
    description: "Discover how artificial intelligence is transforming the way businesses operate.",
    category: "Technology",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor nisl nisi euismod nisi.",
    timeToRead: "8 min"
  },
  {
    id: 3,
    author: "Leslie Alexander",
    authorImage: "/images/user/user-19.jpg",
    title: "How to Build a Sustainable Business Model",
    titleImage: "https://placehold.jp/1280x720.png",
    description: "A comprehensive guide to creating a business that thrives while minimizing environmental impact.",
    category: "Business",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor nisl nisi euismod nisi.",
    timeToRead: "6 min"
  },
  {
    id: 4,
    author: "Cody Fisher",
    authorImage: "/images/user/user-20.jpg",
    title: "5 Web Design Trends to Watch in 2025",
    titleImage: "https://placehold.jp/1280x720.png",
    description: "Stay ahead of the curve with these emerging web design trends that are gaining popularity.",
    category: "Design",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor nisl nisi euismod nisi.",
    timeToRead: "4 min"
  },
  {
    id: 5,
    author: "Dianne Russell",
    authorImage: "/images/user/user-21.jpg",
    title: "The Power of Content Marketing: Case Studies",
    titleImage: "https://placehold.jp/1280x720.png",
    description: "Real-world examples of successful content marketing strategies and their impact.",
    category: "Marketing",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor nisl nisi euismod nisi.",
    timeToRead: "7 min"
  },
  {
    id: 6,
    author: "Cameron Williamson",
    authorImage: "/images/user/user-22.jpg",
    title: "Remote Work: Challenges and Opportunities",
    titleImage: "https://placehold.jp/1280x720.png",
    description: "A deep dive into how remote work is reshaping the workplace landscape.",
    category: "Work Culture",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisl nunc euismod nisi, eu porttitor nisl nisi euismod nisi.",
    timeToRead: "5 min"
  }
];

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalEntries = blogsData.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);

  // Filter blogs based on search term
  const filteredBlogs = blogsData.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastBlog = currentPage * itemsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle add blog button click
  const handleAddBlog = () => {
    // Implementation would go here - e.g., open a modal or navigate to add blog page
    console.log("Add blog button clicked");
  };

  // Handle edit blog button click
  const handleEditBlog = (id: number) => {
    console.log(`Edit blog with ID: ${id}`);
  };

  // Handle delete blog button click
  const handleDeleteBlog = (id: number) => {
    console.log(`Delete blog with ID: ${id}`);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Blogs" />
      <div className="space-y-6">
        <ComponentCard title="Blog Posts">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Search and Add Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <button
                onClick={handleAddBlog}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Blog
              </button>
            </div>

            {/* Blog Cards Grid */}
            <div className="p-4">
              {currentBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentBlogs.map((blog) => (
                    <div 
                      key={blog.id} 
                      className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800"
                    >
                      {/* Blog Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.titleImage}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge size="sm" color="error">
                            {blog.category}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Blog Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 truncate">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3 min-h-16">
                          {blog.description}
                        </p>
                        
                        {/* Blog Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img 
                                src={blog.authorImage} 
                                alt={blog.author} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {blog.author}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            {blog.timeToRead}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-end mt-4 space-x-2">
                          <button
                            onClick={() => handleEditBlog(blog.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Edit blog"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Delete blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No blogs found matching your search.
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/[0.05]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {indexOfFirstBlog + 1} to{" "}
                {Math.min(indexOfLastBlog, filteredBlogs.length)} of{" "}
                {filteredBlogs.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`flex items-center justify-center w-10 h-10 rounded-md border ${
                      currentPage === page
                        ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Blogs;