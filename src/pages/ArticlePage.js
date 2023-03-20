import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CommentsList from "../components/CommentsList";
import articles from "./article-content";
import NotFoundPage from "./NotFoundPage";
import useUser from "../hooks/useUser"
import AddCommentForm from "../components/AddCommentForm";

const ArticlePage = () => {
  const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [], canUpvote: false });
  const { canUpvote } = articleInfo;
  const { articleId } = useParams();

  const { user, isLoading } = useUser();
 
  useEffect(() => {
    const loadArticleInfo = async () => {
      const token = user && await user.getIdToken();
      const headers = token ? { authtoken: token } : {};
      const response = await axios.get(`/api/articles/${articleId}`, { headers });
      const newArticleInfo = response.data;
      console.log(newArticleInfo);
      setArticleInfo(newArticleInfo);
    };

    if(!isLoading){
      loadArticleInfo();
    }
  }, [isLoading, user]);

  const article = articles.find((article) => article.name === articleId);

  const addUpvote = async () => {
    const token = user && await user.getIdToken();
    const headers = token ? { authtoken: token } : {};
    const response = await axios.put(`/api/articles/${articleId}/upvote`, null, { headers });
    const updatedArticle = response.data;
    setArticleInfo(updatedArticle);
  };

  if (!article) {
    return <NotFoundPage />;
  }

  return (
    <>
      <h1>{article.title}</h1>
      <div className="upvotes-section">
        { user 
          ? <button onClick={addUpvote}>{canUpvote ? "Upvote" : "Already Upvoted"}</button>
          : <button>Log In to Upvote</button>
        }
        <p>This article has {articleInfo.upvotes} upvote(s)</p>
      </div>
      {article.content.map((paragraph, index) => {
        return <p key={index}>{paragraph}</p>;
      })}
      { user
        ? <AddCommentForm
          articleName={articleId}
          onArticleUpdate={(updatedArticle) => setArticleInfo(updatedArticle)}
        />
        : <button>Log In to add a comment</button>
      }

      <CommentsList comments={articleInfo.comments} />
    </>
  );
};

export default ArticlePage;
