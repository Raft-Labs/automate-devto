import dotenv from "dotenv";
import axios from "axios";
import chalk from "chalk";

dotenv.config();

let API_KEY;

if (process.argv[2] !== undefined) {
  API_KEY = process.argv[2];
}

// Returns all drafts of a user
async function retrievePosts() {
  const names = [];
  const url = "https://dev.to/api/articles/me/unpublished?per_page=1000";

  return axios
    .get(url, {
      headers: {
        "api-key": API_KEY,
      },
    })
    .then((response) => {
      response.data.map((item) =>
        names.push({
          id: item.id,
          title: item.title,
          body_markdown: item.body_markdown,
          published: item.published,
        })
      );
      return names;
    });
}

// Make the most recent draft -> published
async function updatePost() {
  const unpublishedPosts = await retrievePosts();
  const nextLinedUpArticle = unpublishedPosts[unpublishedPosts.length - 1];
  const payload = {
    article: {
      title: nextLinedUpArticle.title,
      body_markdown: nextLinedUpArticle.body_markdown,
      published: true,
      series: null,
      tags: [],
    },
  };

  try {
    const { data } = await axios({
      method: "PUT",
      url: `https://dev.to/api/articles/${nextLinedUpArticle.id}`,
      data: payload,
      headers: {
        "api-key": API_KEY,
      },
    });

    const outputString = `Published post: ${chalk.yellow(
      data.title
    )}\nYou can check the post at ${chalk.cyan(data.url)}`;
    console.log(outputString);
    return outputString;
  } catch (error) {
    console.log(error);
    return;
  }
}

// Retrieve user's posts
async function retrievePublishedOnly() {
  try {
    const { data } = await axios({
      method: "GET",
      url: `https://dev.to/api/articles/me`,
      headers: {
        "api-key": API_KEY,
      },
    });

    // console.log(data);
    data.map((item) => {
      console.log({
        id: item.id,
        name: item.title,
        posted_time: item.published_at,
      });
    });
    return data;
  } catch (error) {
    console.log(error);
    return;
  }
}

try {
  updatePost();
} catch (error) {
  console.log(error);
}
