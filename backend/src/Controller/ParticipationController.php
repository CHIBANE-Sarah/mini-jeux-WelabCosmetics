<?php
namespace App\Controller;
use App\Entity\Participation;
use App\Repository\SessionRepository;
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
        EntityManagerInterface $em
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);
        $sessionCode  = $body['sessionCode'] ?? null;
        $joueurNom    = $body['joueurNom'] ?? 'Inconnu';
        $joueurPrenom = $body['joueurPrenom'] ?? '';
        $score        = $body['scoreTotal'] ?? 0;
        $duree        = $body['tempsTotal'] ?? 0;

        $session = $sessionRepository->findOneBy(['codeSession' => $sessionCode]);
        if (!$session) {
            return $this->json(['error' => 'Session introuvable'], 404);
        }

        $participation = new Participation();
        $participation->setSession($session);
        $participation->setJoueurNom($joueurNom);
        $participation->setJoueurPrenom($joueurPrenom);
        $participation->setScore($score);
        $participation->setDureeSeconds($duree);

        $em->persist($participation);
        $em->flush();

        return $this->json([
            'message'    => 'Participation enregistrée',
            'id'         => $participation->getId(),
            'scoreTotal' => $score,
        ], 201);
    }

    #[Route('/api/participation', name: 'participation_list', methods: ['GET'])]
    public function getAll(
        EntityManagerInterface $em
    ): JsonResponse {
        $participations = $em->getRepository(Participation::class)->findAll();

        $data = array_map(function (Participation $p) {
            return [
                'id'           => $p->getId(),
                'sessionCode'  => $p->getSession()?->getCodeSession(),
                'sessionTitre' => $p->getSession()?->getTitreSession(),
                'userName'     => $p->getJoueurPrenom() . ' ' . $p->getJoueurNom(),
                'scoreTotal'   => $p->getScore(),
                'tempsTotal'   => $p->getDureeSeconds(),
                'createdAt'    => $p->getCreatedAt()?->format('d/m/Y H:i'),
            ];
        }, $participations);

        return $this->json($data);
    }
}