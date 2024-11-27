'use client'

import { FC, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/components/ui/dialog"
import { Button } from "@repo/ui/components/ui/button"
import { LoginForm } from './loginForm'
import { SignUpForm } from './signupForm'
import { FaChessKing, FaChessQueen } from "react-icons/fa";
import AnimatedAlert from '../ui/animated-alert'
import { Description, DialogTitle } from '@radix-ui/react-dialog'

interface SignUpFormProps {
  onSubmitAction: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<any>;
}

export const AuthModal: FC<SignUpFormProps> = ({ onSubmitAction }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeView, setActiveView] = useState<'login' | 'signup'>('login')

  const [isVisible, setIsVisible] = useState(false);

  const handleShowAlert = () => {
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative w-full bg-gradient-to-r from-amber-900/90 to-amber-800/90 hover:from-amber-800/90 hover:to-amber-700/90 text-amber-100 border-2 border-amber-600/20 shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transform transition-all duration-200 hover:-translate-y-0.5 px-8 py-6"
        >
          <FaChessKing className="mr-2 h-5 w-5" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-xl overflow-hidden">
        <div className="relative">
          {/* Header section */}
          <div className="bg-gradient-to-r from-amber-900 to-amber-800 p-6 border-b border-amber-700">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-amber-500/10 p-3 rounded-full">
                <FaChessQueen className="h-8 w-8 text-amber-200" />
              </div>
              <DialogTitle className='text-2xl font-bold text-amber-100'>
                Chess Arena
                <Description></Description>
              </DialogTitle>
            </div>
          </div>

          {/* Main content */}
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 p-6">
            {/* Toggle buttons */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center rounded-lg p-1 bg-neutral-800/50">
                <Button
                  variant="ghost"
                  className={`px-8 transition-all duration-200 ${activeView === 'login'
                    ? 'bg-gradient-to-r from-amber-700/50 to-amber-600/50 text-amber-100 shadow-lg shadow-amber-900/20'
                    : 'text-neutral-400 hover:text-amber-100 hover:bg-amber-900/30'
                    }`}
                  onClick={() => setActiveView('login')}
                >
                  <FaChessKing className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  variant="ghost"
                  className={`px-8 transition-all duration-200 ${activeView === 'signup'
                    ? 'bg-gradient-to-r from-amber-700/50 to-amber-600/50 text-amber-100 shadow-lg shadow-amber-900/20'
                    : 'text-neutral-400 hover:text-amber-100 hover:bg-amber-900/30'
                    }`}
                  onClick={() => setActiveView('signup')}
                >
                  <FaChessQueen className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </div>
            </div>

            {/* Forms */}
            <div className="space-y-4">
              {activeView === 'login' ? (
                <LoginForm
                  onSuccess={() => setIsOpen(false)}
                  setActiveView={setActiveView}
                />
              ) : (
                <SignUpForm
                  handleShowAlert={handleShowAlert}
                  onSubmitAction={onSubmitAction}
                  setActiveView={setActiveView}
                />
              )}
            </div>
          </div>
        </div>
        <AnimatedAlert
          type="success"
          message="User successfully created!"
          isVisible={isVisible}
          autoHideDuration={5000}
        />
      </DialogContent>
    </Dialog>
  );
}

