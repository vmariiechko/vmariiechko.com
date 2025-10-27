const { DateTime } = require('luxon');

const now = new Date();

const helpers = {
  isLivePost: function (p) {
    return process.env.NODE_ENV === 'development' ? true : p.date <= now;
  },
};

module.exports = {
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

    // Concatenate two arrays
    concat: (arr1, arr2) => {
        return [...(arr1 || []), ...(arr2 || [])];
    },
};