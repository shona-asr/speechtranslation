import Header from "./Header";

interface PageContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const PageContainer = ({ title, description, actions, children }: PageContainerProps) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Header title={title} description={description} actions={actions} />
      {children}
    </div>
  );
};

export default PageContainer;
