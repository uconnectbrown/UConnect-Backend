let db = {
  profiles: [
    {
      email: "ethan_huang1",
      createdAt: "2021-06-28T16:11:21.257Z",
      // basic info
      firstName: "Ethan",
      lastName: "Huang",
      class: "2022",
      majors: ["Applied Mathematics", "", ""], //come from drop down bar
      preferredPronouns: "he/him", //another drop down to avoid trolling (optional)
      // character info
      interests: [
        "Sports Statistics",
        "Nutrition",
        "Movie Cataloging",
        "Data Science",
        "Music",
      ], // 3 to 5
      groups: ["The Starting Eleven", "", ""], // clubs and affinity groups
      varsitySports: ["", "", ""], // drop down
      affinitySports: ["Tennis", "Flag Football", ""],
      greekLife: "",
      favorites: {
        movie: "Schindler's List",
        book: "Animal Farm",
        tvShow: "How I Met Your Mother",
        artist: "Queen",
      }, // 3 to 4?
      bio: "", // paragraph text field for open response
      courses: [
        { courseCode: "DATA 2040", courseName: "Deep Learning", color: "" },
        {
          courseCode: "APMA 1740",
          courseName: "Recent Applications of Probability and Statistics",
          color: "",
        },
        {
          courseCode: "PHP 2530",
          courseName: "Bayesian Statistical Methods",
          color: "",
        },
        {
          courseCode: "APMA 1200",
          courseName: "Operations Research: Probabilistic Models",
          color: "",
        },
        { courseCode: "", courseName: "" },
      ], // 3 to 5
      // courses may be reasonable to make a subcollection
      // choose colors from specified palette
    },
  ],
};
