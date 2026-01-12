import { ArrowUpRight } from 'lucide-react';
import { LoginButton } from '@/components/login-button';
import { SignupButton } from '@/components/signup-button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Separator } from '@/components/ui/separator';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router';
import Logo from "@/Logo";

function Home() {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="w-full flex flex-col items-center justify-center p-10">
      <div className="flex flex-row py-4">
        <Logo width={128} height={128} />
      </div>
      <h1 className="text-6xl block py-4">The Baker's Index</h1>
      <div className="flex flex-row py-4">
        {!isAuthenticated ? (
          <ButtonGroup>
            <LoginButton />
            <SignupButton />
          </ButtonGroup>
        ) : (
          <Link className="text-xl" to="/formulas"><ArrowUpRight className="inline-block" /> Formulas</Link>
        )
        }
      </div>
      <h2 className="text-4xl py-4">
        Modern formula management for bakers - replace your custom spreadsheets!
      </h2>
      <Separator className="bg-amber-900 mt-4 py-px" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 py-4 md:justify-items-center gap-4">
        <div>
          <h3 className="text-2xl py-4">
            Features
          </h3>
          <ul className="list-disc">
            <li>Enter bread formulas in bakers percentages.</li>
            <li>Easily scale formulas to the final yield you want.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-2xl py-4">
            Coming soon
          </h3>
          <ul className="list-disc">
            <li>Enter formulas in weights and get the percentages calculated for you.</li>
            <li>Choose from common product yield sizes for easy scaling (i.e. scale a recipe to 10x hamburger buns or 2x sandwich loaves).</li>
            <li>Add descriptions, notes, tags, and more to your formulas.</li>
            <li>Browse by tag or full-text search to find your formulas.</li>
          </ul>
          <h3 className="text-2xl py-4">
            Changelog
          </h3>
          <h4 className="text-xl pb-4">
            1.0
          </h4>
          <ul className="list-disc">
            <li>Initial release with basic formula entry, editing, management, and scaling.</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-row py-4">
        <p>Found a bug or got a feature suggestion? File it on <a href="https://github.com/singerb/bakersindex/issues/new/choose">our GitHub</a>.</p>
      </div>
    </div>
  )
}

export default Home
