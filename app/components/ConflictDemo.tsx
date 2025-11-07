import { useState } from "react";
import {
  ConflictResolutionDialog,
  type ConflictInfo,
} from "./ConflictResolutionDialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { AlertTriangle, GitMerge, FileText, Users } from "lucide-react";

export function ConflictDemo() {
  const [showConflict, setShowConflict] = useState(false);

  // Sample conflict scenarios
  const scenarios = [
    {
      name: "Simple Addition Conflict",
      description: "One user added a function, another added different code",
      yourContent: `function greet(name) {
  console.log("Hello, " + name);
}

function calculate(a, b) {
  return a + b;
}`,
      theirContent: `function greet(name) {
  console.log("Hello, " + name);
}

function multiply(x, y) {
  return x * y;
}`,
      conflictInfo: {
        expectedVersion: 1,
        currentVersion: 2,
        currentContent: `function greet(name) {
  console.log("Hello, " + name);
}

function multiply(x, y) {
  return x * y;
}`,
        hasConflict: true,
        lastModified: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
    },
    {
      name: "Line Modification Conflict",
      description: "Both users modified the same line differently",
      yourContent: `const config = {
  apiUrl: "https://api.myapp.com/v1",
  timeout: 5000,
  retries: 3
};`,
      theirContent: `const config = {
  apiUrl: "https://api.myapp.com/v2",
  timeout: 10000,
  retries: 3
};`,
      conflictInfo: {
        expectedVersion: 2,
        currentVersion: 3,
        currentContent: `const config = {
  apiUrl: "https://api.myapp.com/v2",
  timeout: 10000,
  retries: 3
};`,
        hasConflict: true,
        lastModified: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      },
    },
    {
      name: "Complex Merge Conflict",
      description: "Multiple conflicting changes across different sections",
      yourContent: `import React from 'react';
import { useState } from 'react';

export function MyComponent({ title }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    setCount(prev => prev + 1);
    console.log('Button clicked');
  };

  return (
    <div className="my-component">
      <h1>{title}</h1>
      <button onClick={handleClick}>
        Count: {count}
      </button>
    </div>
  );
}`,
      theirContent: `import React from 'react';
import { useState, useEffect } from 'react';

export function MyComponent({ title, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  const handleClick = () => {
    setCount(prev => prev + 2);
    console.log('Button was clicked');
  };

  return (
    <div className="my-component enhanced">
      <h1>{title}</h1>
      <button onClick={handleClick} className="count-button">
        Count: {count}
      </button>
      {isVisible && <p>Component is visible</p>}
    </div>
  );
}`,
      conflictInfo: {
        expectedVersion: 3,
        currentVersion: 4,
        currentContent: `import React from 'react';
import { useState, useEffect } from 'react';

export function MyComponent({ title, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  const handleClick = () => {
    setCount(prev => prev + 2);
    console.log('Button was clicked');
  };

  return (
    <div className="my-component enhanced">
      <h1>{title}</h1>
      <button onClick={handleClick} className="count-button">
        Count: {count}
      </button>
      {isVisible && <p>Component is visible</p>}
    </div>
  );
}`,
        hasConflict: true,
        lastModified: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      },
    },
  ];

  const [currentScenario, setCurrentScenario] = useState(scenarios[0]);

  const handleResolveConflict = (
    resolvedContent: string,
    newVersion: number,
  ) => {
    console.log("Conflict resolved:", { resolvedContent, newVersion });
    setShowConflict(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <GitMerge className="h-8 w-8 text-blue-500" />
          Conflict Resolution Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Experience our advanced conflict resolution system in action
        </p>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Features Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold">Smart Detection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically detects version conflicts using optimistic locking
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <GitMerge className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Three-Way Merge</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligent merging with visual diff comparison
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">User-Friendly</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive resolution with multiple strategies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Conflict Scenarios</CardTitle>
          <CardDescription>
            Choose a scenario to see how our conflict resolution works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  currentScenario === scenario
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => setCurrentScenario(scenario)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{scenario.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scenario.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      currentScenario === scenario ? "default" : "secondary"
                    }
                  >
                    {currentScenario === scenario ? "Selected" : "Select"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-center">
            <Button
              onClick={() => setShowConflict(true)}
              className="flex items-center gap-2"
              size="lg"
            >
              <AlertTriangle className="h-4 w-4" />
              Simulate Conflict Resolution
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Scenario Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview: {currentScenario.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                Your Version
              </h4>
              <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded border overflow-x-auto">
                {currentScenario.yourContent}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2 text-blue-700 dark:text-blue-400">
                Their Version
              </h4>
              <pre className="text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded border overflow-x-auto">
                {currentScenario.theirContent}
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Expected Version: {currentScenario.conflictInfo.expectedVersion}
            </span>
            <span>
              Current Version: {currentScenario.conflictInfo.currentVersion}
            </span>
            <span>
              Modified:{" "}
              {currentScenario.conflictInfo.lastModified.toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Strategies</CardTitle>
          <CardDescription>
            Our system offers multiple ways to resolve conflicts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Keep Your Changes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preserve your version and discard the other user's changes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Accept Their Changes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the other user's version and discard your changes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Manual Merge</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manually edit the content to combine both versions with full
                  control
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Auto-merge (when possible)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Intelligent automatic merging for non-conflicting changes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Resolution Dialog */}
      {showConflict && (
        <ConflictResolutionDialog
          isOpen={showConflict}
          onClose={() => setShowConflict(false)}
          fileName="example.js"
          fileId="demo-file-id"
          yourContent={currentScenario.yourContent}
          conflictInfo={currentScenario.conflictInfo}
          onResolved={handleResolveConflict}
        />
      )}
    </div>
  );
}
