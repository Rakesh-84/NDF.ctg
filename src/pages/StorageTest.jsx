import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function StorageTest() {
  const [message, setMessage] = useState('')

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const fileName = `test-${Date.now()}.${file.name.split('.').pop()}`

    const { data, error } = await supabase.storage
      .from('event-photos')
      .upload(fileName, file)

    if (error) {
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage(`✅ Uploaded: ${data.path}`)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Storage Test</h2>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <p className="mt-4">{message}</p>
    </div>
  )
}