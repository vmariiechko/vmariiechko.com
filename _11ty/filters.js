const { DateTime } = require('luxon');

const now = new Date();

const helpers = {
  isLivePost: function (p) {
    return process.env.NODE_ENV === 'development' ? true : p.date <= now;
  },
};

module.exports = {
    limit: (array, limit) => {
        return array.slice(0, limit);
    },

    formatDate: (date, format) => {
        return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(format);
    },

    absoluteUrl: (url, base) => {
        return new URL(url, base).toString();
    },

    filterLivePosts: (collection) => {
        return collection.filter(helpers.isLivePost);
    },

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    htmlDateString: (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
    },

    readableDate: (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
            'dd LLL yyyy'
        );
    },

    // Concatenate two arrays
    concat: (arr1, arr2) => {
        return [...(arr1 || []), ...(arr2 || [])];
    },

    // Calculate reading time from content
    // Prefers manual front matter, falls back to word-count computation
    readingTime: (post) => {
        // If manually specified in front matter, use it
        if (post.data && post.data.readingTime) {
            return post.data.readingTime;
        }

        // Auto-compute from content
        // Try multiple content sources depending on context (collection item vs page object)
        const content = post.templateContent || post.content || '';

        if (typeof content !== 'string' || content.length === 0) {
            return '1 min read'; // Fallback for empty content
        }

        // Strip HTML tags and count words
        const text = content.replace(/<[^>]*>/g, '').trim();
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const minutes = Math.ceil(words / 200); // 200 words per minute
        const readingTime = Math.max(1, minutes); // Minimum 1 minute

        return `${readingTime} min read`;
    },

    // Extract table of contents from rendered content
    // Returns array of {level, text, id} objects for h2-h4 headings
    extractToc: (content) => {
        if (typeof content !== 'string') {
            return [];
        }

        const headings = [];
        const headingRegex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g;
        let match;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = parseInt(match[1]);
            const id = match[2];
            const text = match[3].replace(/<[^>]*>/g, '').trim(); // Strip inner tags

            headings.push({ level, id, text });
        }

        return headings;
    },

    // Detect content type from URL path
    // @param {string} url - The URL to detect the content type from
    // @returns {string} The content type: 'short-byte' or 'post'
    getContentType: (url) => {
        if (url.includes('/short-bytes/')) {
            return 'short-byte';
        }
        return 'post';
    },
};