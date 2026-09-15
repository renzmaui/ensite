type BreadcrumbProps = {
  parent: string;
  parentPath: string;
  current: string;
};

function Breadcrumb({
  parent,
  parentPath,
  current,
}: BreadcrumbProps) {
  return (
    <p className="ensite-label ensite-breadcrumb">
      <a href={parentPath}>{parent}</a>
      <span> / {current}</span>
    </p>
  );
}

export default Breadcrumb;