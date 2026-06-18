"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navbar from "@/components/cars/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Lock, User, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Props {
  user: SupabaseUser
  initialUsername: string
  initialAvatarUrl: string | null
}

export default function AccountClient({ user, initialUsername, initialAvatarUrl }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [username, setUsername] = useState(initialUsername)
  // Clean URL stored in DB (no timestamp)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  // Timestamp version for display only (busts browser cache after upload)
  const [avatarDisplay, setAvatarDisplay] = useState<string | null>(
    initialAvatarUrl ? `${initialAvatarUrl}?t=${Date.now()}` : null
  )
  const [uploading, setUploading] = useState(false)

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const saveProfileToDb = async (newUsername: string, newAvatarUrl: string | null) => {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username: newUsername.trim(),
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      })
    if (error) throw error
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarDisplay(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    setProfileMsg(null)
    try {
      const ext = file.name.split(".").pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      // Get clean public URL (no timestamp) for DB storage
      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      const cleanUrl = data.publicUrl
      const displayUrl = `${cleanUrl}?t=${Date.now()}`

      setAvatarUrl(cleanUrl)
      setAvatarDisplay(displayUrl)

      // Auto-save avatar immediately after upload
      await saveProfileToDb(username, cleanUrl)
      setProfileMsg({ type: "success", text: "Profile photo saved!" })
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? JSON.stringify(err) ?? "Failed to upload image"
      setProfileMsg({ type: "error", text: `Upload failed: ${msg}` })
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      await saveProfileToDb(username, avatarUrl)
      setProfileMsg({ type: "success", text: "Profile updated!" })
      // Hard reload so the navbar re-fetches the updated profile
      window.location.href = "/account"
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile"
      setProfileMsg({ type: "error", text: msg })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords don't match." })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." })
      return
    }
    setSavingPassword(true)
    setPasswordMsg(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordMsg({ type: "success", text: "Password changed successfully!" })
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password"
      setPasswordMsg({ type: "error", text: msg })
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* ── Profile Section ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              {avatarDisplay ? (
                <img
                  src={avatarDisplay}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-gray-600" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Profile photo</p>
              <p className="text-xs text-gray-500 mt-0.5">JPG, PNG or GIF · Max 5 MB</p>
              <p className="text-xs text-gray-400 mt-0.5">Photo saves automatically after upload</p>
            </div>
          </div>

          {/* Username */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              className="max-w-sm"
            />
          </div>

          {/* Email (read-only) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <Input value={user.email ?? ""} disabled className="max-w-sm bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
          </div>

          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm mb-4 ${profileMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {profileMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {profileMsg.text}
            </div>
          )}

          <Button onClick={handleSaveProfile} disabled={savingProfile || uploading}>
            {savingProfile ? "Saving…" : "Save Profile"}
          </Button>
        </div>

        {/* ── Password Section ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>

          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          {passwordMsg && (
            <div className={`flex items-center gap-2 text-sm mt-4 mb-2 ${passwordMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {passwordMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {passwordMsg.text}
            </div>
          )}

          <Button onClick={handleChangePassword} disabled={savingPassword} className="mt-4">
            {savingPassword ? "Changing…" : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  )
}
