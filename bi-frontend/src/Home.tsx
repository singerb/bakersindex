import { Croissant, Folders } from 'lucide-react';
import { LoginButton } from './components/login-button';
import { SignupButton } from './components/signup-button';
import { ButtonGroup } from './components/ui/button-group';

function Home() {
  return (
    <div className="min-h-svh w-full flex flex-col items-center justify-center p-6 md:p-10">
      <div className="flex flex-row py-8">
        <Croissant size={128} />
        <Folders size={128} />
      </div>
      <h1 className="text-6xl block py-8">The Baker's Index</h1>
      <div className="flex flex-row py-8">
        <ButtonGroup>
          <LoginButton />
          <SignupButton />
        </ButtonGroup>
      </div>
      <p className="py-8">
      Modern formula management for bakers - replace your custom spreadsheets!
      </p>
    </div>
  )
}

export default Home
