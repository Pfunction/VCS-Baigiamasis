import ToolGrid from './ToolGrid';

const SearchResults = ({ results }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolGrid products={results} isSearchResult={true} />
    </div>
  );
};

export default SearchResults;