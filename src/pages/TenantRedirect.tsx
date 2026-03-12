import { Navigate, useParams } from "react-router-dom";

export default function TenantRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/${slug}`} replace />;
}
