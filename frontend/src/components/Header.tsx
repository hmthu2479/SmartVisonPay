type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  return (
    <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
    </header>
  );
};

export default Header;
