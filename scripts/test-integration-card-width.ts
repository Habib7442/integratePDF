/**
 * Test script to verify integration card width fix
 */

import fs from 'fs'
import path from 'path'

function testIntegrationCardWidth() {
  console.log('Testing Integration Card Width Fix...\n')

  const results = {
    gridLayoutRemoved: false,
    fullWidthImplemented: false,
    responsiveDesign: false,
    integrationsStoreConnected: false,
    enhancedContent: false
  }

  try {
    // Test 1: Check if grid layout was removed
    console.log('1. Testing grid layout removal...')
    const dashboardPath = path.join(process.cwd(), 'app', 'dashboard', 'page.tsx')
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8')
    
    // Check if the old grid layout is removed
    if (!dashboardContent.includes('grid grid-cols-1 md:grid-cols-2')) {
      console.log('✅ Old constrained grid layout removed')
      results.gridLayoutRemoved = true
    } else {
      console.log('❌ Old grid layout still present')
    }

    // Test 2: Check if full width card is implemented
    console.log('\n2. Testing full width implementation...')
    if (dashboardContent.includes('Integrations Section') && 
        dashboardContent.includes('Card className="mb-8"')) {
      console.log('✅ Full width integration card implemented')
      results.fullWidthImplemented = true
    } else {
      console.log('❌ Full width integration card not found')
    }

    // Test 3: Check for responsive design
    console.log('\n3. Testing responsive design...')
    if (dashboardContent.includes('flex flex-col sm:flex-row') && 
        dashboardContent.includes('flex-1')) {
      console.log('✅ Responsive design implemented (mobile-first)')
      results.responsiveDesign = true
    } else {
      console.log('❌ Responsive design not properly implemented')
    }

    // Test 4: Check integrations store connection
    console.log('\n4. Testing integrations store connection...')
    if (dashboardContent.includes('useIntegrations') && 
        dashboardContent.includes('userIntegrations')) {
      console.log('✅ Integrations store properly connected')
      results.integrationsStoreConnected = true
    } else {
      console.log('❌ Integrations store not connected')
    }

    // Test 5: Check for enhanced content
    console.log('\n5. Testing enhanced content...')
    if (dashboardContent.includes('active integration') && 
        dashboardContent.includes('CheckCircle') &&
        dashboardContent.includes('streamline your document processing')) {
      console.log('✅ Enhanced content with integration status')
      results.enhancedContent = true
    } else {
      console.log('❌ Enhanced content not found')
    }

    // Test 6: Check store provider exports
    console.log('\n6. Testing store provider exports...')
    const storeProviderPath = path.join(process.cwd(), 'components', 'providers', 'store-provider.tsx')
    const storeProviderContent = fs.readFileSync(storeProviderPath, 'utf8')
    
    if (storeProviderContent.includes('export { useIntegrations }')) {
      console.log('✅ Store provider exports useIntegrations')
    } else {
      console.log('❌ Store provider missing useIntegrations export')
    }

    // Test 7: Check CSS classes for width
    console.log('\n7. Testing CSS classes...')
    const hasFullWidthClasses = dashboardContent.includes('w-full') || 
                               dashboardContent.includes('flex-1') ||
                               !dashboardContent.includes('md:grid-cols-2')
    
    if (hasFullWidthClasses) {
      console.log('✅ Proper CSS classes for full width')
    } else {
      console.log('❌ Missing full width CSS classes')
    }

    // Summary
    console.log('\n=== Test Summary ===')
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    
    console.log(`Passed: ${passedTests}/${totalTests} tests`)
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌'
      const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      console.log(`${status} ${testName}`)
    })

    // Visual comparison
    console.log('\n=== Visual Changes ===')
    console.log('Before: Integration card constrained to 50% width on medium+ screens')
    console.log('After:  Integration card spans full width with responsive button layout')
    console.log('')
    console.log('Layout Changes:')
    console.log('• Removed: grid grid-cols-1 md:grid-cols-2 (constrained width)')
    console.log('• Added:   Card className="mb-8" (full width)')
    console.log('• Added:   flex flex-col sm:flex-row (responsive layout)')
    console.log('• Added:   Integration status indicator')
    console.log('• Added:   Enhanced description text')

    // Recommendations
    console.log('\n=== Recommendations ===')
    if (passedTests === totalTests) {
      console.log('🎉 Integration card width fix successfully implemented!')
      console.log('')
      console.log('Benefits:')
      console.log('• Better use of screen real estate')
      console.log('• More prominent integration management')
      console.log('• Responsive design for all screen sizes')
      console.log('• Integration status visibility')
      console.log('• Consistent with other full-width sections')
    } else {
      console.log('⚠️  Some issues found. Please review the implementation.')
    }

    return passedTests === totalTests

  } catch (error) {
    console.error('❌ Test failed with error:', error)
    return false
  }
}

// Test the specific UI improvement
function testUIImprovement() {
  console.log('\n=== UI Improvement Analysis ===')
  
  try {
    const dashboardPath = path.join(process.cwd(), 'app', 'dashboard', 'page.tsx')
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8')
    
    console.log('Analyzing layout structure...')
    
    // Check for the new structure
    if (dashboardContent.includes('Integrations Section')) {
      console.log('✅ New section structure implemented')
      
      // Check for responsive button layout
      if (dashboardContent.includes('flex flex-col sm:flex-row')) {
        console.log('✅ Responsive button layout implemented')
      }
      
      // Check for integration status
      if (dashboardContent.includes('active integration')) {
        console.log('✅ Integration status indicator added')
      }
      
      // Check for enhanced description
      if (dashboardContent.includes('streamline your document processing')) {
        console.log('✅ Enhanced description text added')
      }
    }
    
    console.log('\n📱 Mobile-First Design:')
    console.log('• Mobile: Single column layout (flex-col)')
    console.log('• Desktop: Horizontal layout (sm:flex-row)')
    console.log('• Button: Full width on mobile, flexible on desktop')
    
    console.log('\n🎨 Visual Improvements:')
    console.log('• Full width utilization')
    console.log('• Better visual hierarchy')
    console.log('• Integration status visibility')
    console.log('• Consistent spacing with other sections')
    
  } catch (error) {
    console.error('Error in UI improvement analysis:', error)
  }
}

// Run the tests
if (require.main === module) {
  testIntegrationCardWidth()
    .then(success => {
      testUIImprovement()
      console.log('\n' + '='.repeat(50))
      if (success) {
        console.log('🎉 Integration card width fix verification PASSED!')
      } else {
        console.log('❌ Integration card width fix verification FAILED!')
      }
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Test script failed:', error)
      process.exit(1)
    })
}

export { testIntegrationCardWidth }
