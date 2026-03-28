<?php

namespace App\Controller;

use App\Entity\Participation;
use App\Repository\SessionRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ParticipationController extends AbstractController
{
    #[Route('/api/participation/save', name: 'participation_save', methods: ['POST'])]
    public function save(
        Request $request,
        SessionRepository $sessionRepository,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);

        $sessionCode = $body['sessionCode'] ?? null;
        $userId      = $body['userId'] ?? null;
        $scoreTotal  = $body['scoreTotal'] ?? 0;
        $tempsTotal  = $body['tempsTotal'] ?? 0;

        $session = $sessionRepository->findOneBy(['codeSession' => $sessionCode]);
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $participation = new Participation();
        $participation->setSession($session);
        $participation->setUser($user);
        $participation->setScoreTotal($scoreTotal);
        $participation->setTempsTotal($tempsTotal);

        $em->persist($participation);
        $em->flush();

        return $this->json([
            'message'    => 'Participation enregistrée',
            'id'         => $participation->getId(),
            'scoreTotal' => $scoreTotal,
            'tempsTotal' => $tempsTotal,
        ], 201);
    }
}