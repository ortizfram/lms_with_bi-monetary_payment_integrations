const Course = require("../model/Course");
const jwt = require("jsonwebtoken");

// course create
const create_course = async (req, res, next) => {
  try {
    const imageUrl =
      req.files && req.files["image"]
        ? "/uploads/" + req.files["image"][0].filename
        : null;
    const videoUrl =
      req.files && req.files["video"]
        ? "/uploads/" + req.files["video"][0].filename
        : null;

    if (!imageUrl && !videoUrl) {
      return res.status(400).send("No files uploaded.");
    }

    // Extract necessary data from request body
    const {
      title,
      description,
      text_content,
      ars_price,
      usd_price,
      discount_ars,
      discount_usd,
      author: authorId,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "text_content",
      "ars_price",
      "usd_price",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ message: `The field '${field}' is required.` });
      }
    }

    // Ensure title is a string
    let courseTitle = title;
    if (typeof title !== "string") {
      courseTitle = String(title);
    }

    // Generate course slug
    const courseSlug = slugify(courseTitle, { lower: true, strict: true });

    // Manage discount value
    const discountArs = discount_ars || null;
    const discountUsd = discount_usd || null;

    // Generate unique filename for thumbnail
    const timestamp = Date.now();
    const thumbnailFilename = req.files["image"][0].filename;
    const thumbnailPath = req.files["image"]
      ? "/uploads/imgs/" + req.files["image"][0].filename
      : null;

    // Generate unique filename for video
    const videoFilename = req.files["video"][0].filename;
    const videoPath = req.files["video"]
      ? "/uploads/videos/" + req.files["video"][0].filename
      : null;

    // Get current timestamp
    const currentDate = new Date();
    const currentTimestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    // Prepare course data
    const courseData = [
      courseTitle,
      courseSlug,
      description,
      text_content,
      ars_price,
      usd_price,
      discountArs,
      discountUsd,
      thumbnailPath,
      videoPath,
      currentTimestamp,
      currentTimestamp,
      authorId,
    ];

    // Insert course data into the database
    const sql = `INSERT INTO courses (title, slug, description, text_content, ars_price, usd_price, discount_ars, discount_usd, thumbnail, video, created_at, updated_at, author_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.promise().execute(sql, courseData);

    // Fetch the created course
    const [fetchedCourse] = await db
      .promise()
      .execute(`SELECT * FROM courses WHERE slug = ?`, [courseSlug]);
    const course = fetchedCourse[0];

    console.log("\nCreating course...");
    console.log("\nCourse:", course);

    // Redirect after creating the course
    return res.status(201).json({
      message: "Course created successfully",
      redirectUrl: `/api/courses`,
    });
  } catch (error) {
    console.error("Error creating the course:", error);
    return res.status(500).json({
      message: "Error creating the course",
      error: error.message,
    });
  }
};

// // course update
// router.put(
//   "/course/update/:id",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "video", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     console.log(req.body);
//     console.log(req.files);

//     try {
//       const courseId = req.params.id;

//       // Fetch existing course from the database
//       const [existingCourse] = await db
//         .promise()
//         .execute(`SELECT * FROM courses WHERE id = ?`, [courseId]);
//       const course = existingCourse[0];

//       if (!course) {
//         return res.status(404).json({ message: "Course not found." });
//       }

//       // Extract necessary data from request body
//       const {
//         title,
//         description,
//         text_content,
//         ars_price,
//         usd_price,
//         discount_ars,
//         discount_usd,
//         author: authorId,
//       } = req.body;

//       // Validate required fields
//       const requiredFields = [
//         "title",
//         "description",
//         "text_content",
//         "ars_price",
//         "usd_price",
//       ];
//       for (const field of requiredFields) {
//         if (!req.body[field]) {
//           return res
//             .status(400)
//             .json({ message: `The field '${field}' is required.` });
//         }
//       }

//       // Ensure title is a string
//       let courseTitle = title;
//       if (typeof title !== "string") {
//         courseTitle = String(title);
//       }

//       // Manage discount value
//       const discountArs = discount_ars || null;
//       const discountUsd = discount_usd || null;

//       // Update course details
//       const sql = `UPDATE courses SET
//           title = ?,
//           description = ?,
//           text_content = ?,
//           ars_price = ?,
//           usd_price = ?,
//           discount_ars = ?,
//           discount_usd = ?
//           WHERE id = ?`;
//       await db
//         .promise()
//         .execute(sql, [
//           title,
//           description,
//           text_content,
//           ars_price,
//           usd_price,
//           discountArs,
//           discountUsd,
//           courseId,
//         ]);

//       console.log("\nUpdating course...");
//       console.log("\nCourse:", course);

//       // Redirect after updating the course
//       return res.status(200).json({
//         message: "Course updated successfully",
//         redirectUrl: `/api/courses`,
//       });
//     } catch (error) {
//       console.error("Error updating the course:", error);
//       return res.status(500).json({
//         message: "Error updating the course",
//         error: error.message,
//       });
//     }
//   }
// );

// // courses list
// router.get("/courses", async (req, res) => {
//   try {
//     const message = req.query.message;
//     let user = req.session.user;
//     const isAdmin = user && user.role === "admin";

//     // Fetch all courses ordered by updated_at descending
//     let sql = `
//         SELECT
//           courses.*,
//           users.id AS author_id,
//           users.name AS author_name,
//           users.username AS author_username,
//           users.avatar AS author_avatar
//         FROM
//           courses
//         LEFT JOIN
//           users ON users.id = courses.author_id
//         ORDER BY
//           courses.updated_at DESC
//       `;

//     const [coursesRows] = await db.promise().query(sql);
//     console.log("coursesRows: ", coursesRows);

//     let courses = coursesRows.map((course) => {
//       return {
//         title: course.title,
//         slug: course.slug,
//         description: course.description,
//         ars_price: course.ars_price,
//         usd_price: course.usd_price,
//         discount_ars: course.discount_ars,
//         discount_usd: course.discount_usd,
//         thumbnail: course.thumbnail,
//         id: course.id.toString(),
//         thumbnailPath: course.thumbnail,
//         created_at: new Date(course.created_at).toLocaleString(),
//         updated_at: new Date(course.updated_at).toLocaleString(),
//         author: {
//           name: course.author_name,
//           username: course.author_username,
//           avatar: course.author_avatar,
//         },
//         next: `/api/course/${course.id}`, // Dynamic course link
//       };
//     });

//     // Filter courses for enrolled user
//     let enrolledCourseIds = [];
//     if (user) {
//       const enrolledSql = `
//           SELECT
//             courses.*,
//             users.name AS author_name,
//             users.username AS author_username,
//             users.avatar AS author_avatar
//           FROM
//             user_courses
//           JOIN
//             courses ON user_courses.course_id = courses.id
//           JOIN
//             users ON courses.author_id = users.id
//           WHERE
//             user_courses.user_id = ?
//         `;
//       const [enrolledCoursesRows] = await db
//         .promise()
//         .query(enrolledSql, [user.id]);
//       enrolledCourseIds = enrolledCoursesRows.map((enrolledCourse) =>
//         enrolledCourse.id.toString()
//       );
//     }

//     // Filter out enrolled courses
//     courses = courses.filter(
//       (course) => !enrolledCourseIds.includes(course.id)
//     );

//     // Send courses response
//     res.status(200).json({
//       route: "courses",
//       title: "Cursos",
//       courses,
//       totalItems: courses.length,
//       user,
//       message,
//       isAdmin,
//     });
//   } catch (error) {
//     console.log("Error fetching courses:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // courses-owned list
// router.get(
//   // courses-owned list
//   "/courses-owned",
//   async (req, res) => {
//     try {
//       const message = req.query.message;
//       let user = req.session.user;
//       const isAdmin = user && user.role === "admin";

//       // Fetch all courses ordered by updated_at descending
//       let sql = `
//         SELECT
//           courses.*,
//           users.id AS author_id,
//           users.name AS author_name,
//           users.username AS author_username,
//           users.avatar AS author_avatar
//         FROM
//           courses
//         LEFT JOIN
//           users ON users.id = courses.author_id
//         ORDER BY
//           courses.updated_at DESC
//       `;

//       const [coursesRows] = await db.promise().execute(sql);

//       let courses = coursesRows.map((course) => {
//         return {
//           id: course.id,
//           title: course.title,
//           slug: course.slug,
//           description: course.description,
//           ars_price: course.ars_price,
//           usd_price: course.usd_price,
//           discount_ars: course.discount_ars,
//           discount_usd: course.discount_usd,
//           thumbnail: course.thumbnail,
//           id: course.id.toString(),
//           thumbnailPath: course.thumbnail,
//           created_at: new Date(course.created_at).toLocaleString(),
//           updated_at: new Date(course.updated_at).toLocaleString(),
//           author: {
//             name: course.author_name,
//             username: course.author_username,
//             avatar: course.author_avatar,
//           },
//           next: `/api/course/${course.id}`, // Dynamic course link
//         };
//       });

//       // Filter courses for enrolled user
//       if (user) {
//         const enrolledSql = `
//           SELECT
//             course_id
//           FROM
//             user_courses
//           JOIN
//             courses ON user_courses.course_id = courses.id
//           WHERE
//             user_courses.user_id = ?
//         `;
//         const [enrolledCoursesRows] = await db
//           .promise()
//           .execute(enrolledSql, [user.id]);
//         const enrolledCourseIds = enrolledCoursesRows.map((row) =>
//           row.course_id.toString()
//         );

//         // Filter out courses not enrolled by the user
//         courses = courses.filter((course) =>
//           enrolledCourseIds.includes(course.id)
//         );
//         console.log("\ncourses: ", courses);
//       } else {
//         // If no user is logged in, return an empty array
//         courses = [];
//         console.log("\n\nuser not logged in,\ncourses: ", courses);
//       }

//       // Send courses response
//       res.status(200).json({
//         route: "courses",
//         title: "Cursos",
//         courses,
//         totalItems: courses.length,
//         user,
//         message,
//         isAdmin,
//       });
//     } catch (error) {
//       console.log("Error fetching courses:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );

// //course detail
// router.get(
//   "/course/:id",
//   async (req, res) => {
//     let courseId = req.params.id;
//     const user = req.session.user || null;
//     const message = req.query.message;

//     try {
//       console.log("\nCourseId:", courseId);
//       let sql = `
//           SELECT
//             courses.*,
//             users.id AS author_id,
//             users.name AS author_name,
//             users.username AS author_username,
//             users.avatar AS author_avatar
//           FROM
//             courses
//           LEFT JOIN
//             users ON users.id = courses.author_id
//           WHERE
//             courses.id = ?;
//         `;
//       const [courseRows] = await db.promise().execute(sql, [courseId]);

//       if (!courseRows || courseRows.length === 0) {
//         return res.status(404).json({ error: "Course not found" });
//       }

//       const course = courseRows[0];
//       // console.log(course);
//       // console.log("\n\ncourse.video", course.video);
//       courseId = course.id;

//       // Format course timestamps and video_link
//       const formattedCourse = {
//         ...course,
//         created_at: new Date(course.created_at).toLocaleString(),
//         updated_at: new Date(course.updated_at).toLocaleString(),
//       };

//       if (!course) {
//         return res.status(404).json({ error: "Course not found" });
//       }

//       // Fetching author details
//       sql = `
//           SELECT
//             id AS author_id,
//             name AS author_name,
//             username AS author_username,
//             avatar AS author_avatar
//           FROM
//             users
//           WHERE
//             id = ?;
//         `;
//       const [authorRows] = await db.promise().execute(sql, [course.author_id]);
//       const author = authorRows[0];
//       // console.log(author);

//       if (!author) {
//         return res.status(404).json({ error: "Author details not found" });
//       }

//       // Extend formattedCourse with author details
//       formattedCourse.author = {
//         name: author.author_name,
//         username: author.author_username,
//         avatar: author.author_avatar,
//       };
//       // console.log(formattedCourse.author);

//       // Fill array with query result
//       let enrolledCourses = [];
//       sql = `
//           SELECT
//             courses.*,
//             users.name AS author_name,
//             users.username AS author_username,
//             users.avatar AS author_avatar
//           FROM
//             user_courses
//           JOIN
//             courses ON user_courses.course_id = courses.id
//           JOIN
//             users ON courses.author_id = users.id
//           WHERE
//             user_courses.user_id = ?;
//         `;
//       if (user) {
//         const [enrolledRows] = await db.promise().execute(sql, [user.id]);
//         enrolledCourses = enrolledRows[0]?.enrolled_courses || [];
//       }

//       // Send JSON response with the fetched data
//       res.json({
//         course: formattedCourse,
//         message,
//         user,
//         enrolledCourses,
//       });
//     } catch (error) {
//       console.error("Error fetching the course:", error);
//       res.status(500).json({ error: "Error fetching the course" });
//     }
//   }
// );

// //course delete
// router.post(
//   "/course/delete/:id",
//   async (req, res) => {
//     try {
//       const courseId = req.params.id;

//       const result = await db
//         .promise()
//         .execute("DELETE FROM courses WHERE id = ?", [courseId]);

//       // Check if any rows were affected by the deletion
//       if (result && result[0].affectedRows !== undefined) {
//         const affectedRows = parseInt(result[0].affectedRows);

//         // Respond with a success message
//         if (affectedRows > 0) {
//           return res
//             .status(200)
//             .json({ message: "Course deleted successfully" });
//         } else {
//           return res.status(404).json({ message: "Course not found" });
//         }
//       }
//     } catch (error) {
//       console.error("Error deleting course:", error);
//       res.status(500).json({ message: "Error deleting the course" });
//     }
//   }
// );

exports.create_course = create_course;
